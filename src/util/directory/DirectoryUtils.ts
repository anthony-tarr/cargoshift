import { Dirent } from 'fs';
import { DirectoryTreeRow } from '../../model/DirectoryTreeRow';

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
  const isLink = dir.isSymbolicLink();
  return {
    name: dir.name,
    isLink,
    linkedPath: isLink ? fs.readlinkSync(`${path}\\${dir.name}`) : null,
    path: `${path}${dir.name}`,
  };
};
