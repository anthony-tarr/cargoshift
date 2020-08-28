import { Dirent } from 'fs';
import { DirectoryTreeRow } from '../../model/DirectoryTreeRow';
import eachAsync from 'tiny-each-async';
import path from 'path';
const fs = window.require('fs');

export function getSubdirectories(path: string) {
  const subdirs = fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent: Dirent) => {
      // const isHidden = fileIsHidden(`${path}\\${dirent.name}`);
      // if (isHidden) {
      //   return false;
      // }
      return dirent.isDirectory() || dirent.isSymbolicLink();
    })
    .map((dir: Dirent) => mapColumns(dir, path));
  return subdirs;
}

const mapColumns = (dir: Dirent, path: string): DirectoryTreeRow => {
  let finalPath = `${path}\\${dir.name}`;
  if (path.endsWith('\\')) {
    finalPath = `${path}${dir.name}`;
  }
  const isLink = dir.isSymbolicLink();
  return {
    name: dir.name,
    isLink,
    linkedPath: isLink ? fs.readlinkSync(`${path}\\${dir.name}`) : null,
    path: finalPath,
  };
};

export function readFolderSize(...args: any[]) {
  console.log('attempting to read for directory: ' + args[0]);
  args.unshift(new Set());

  return readSizeRecursive(...args);
}

// Default was 5000 but that thrashes the SSD
const MAX_CONCURRENT_ASYNC = 5000;

function readSizeRecursive(seen: Set<any>, directory: string, callback: (err?: Error, size?: number) => void) {
  fs.stat(directory, function stat(e, stats) {
    let total = !e ? stats.size || 0 : 0;

    if (stats) {
      if (seen.has(stats.ino)) {
        return callback(undefined, 0);
      }

      seen.add(stats.ino);
    }

    if (!e && stats.isDirectory()) {
      fs.readdir(directory, (err, list) => {
        if (err) {
          console.error('Error inside the function', err);
          //return callback(err);
        } else {
          eachAsync(
            list,
            MAX_CONCURRENT_ASYNC,
            (dirItem, next) => {
              readSizeRecursive(seen, path.join(directory, dirItem), (error, size) => {
                if (!error) {
                  total += size;
                }

                next();
              });
            },
            (finalErr) => {
              callback(finalErr, total);
            }
          );
        }
      });
    } else {
      callback(undefined, total);
    }
  });
}
