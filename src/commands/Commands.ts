import { stringify } from 'querystring';

const electron = window.require('electron');
const child_process = window.require('child_process');

const ROBOCOPY_THREADS = 16;

export function robocopy(source: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const robocopyProcess = child_process.spawn('robocopy', [
      '/S',
      '/E',
      `/MT:${ROBOCOPY_THREADS}`,
      '/V',
      source,
      destination,
    ]);

    robocopyProcess.stdout.on('data', (data: Buffer | string) => {
      // send this to the log eventually
      console.log(data.toString());
    });

    robocopyProcess.stdout.on('end', () => {
      // send this to the log eventually
      console.log('No more data to read.');
      resolve();
    });

    robocopyProcess.stdout.on('close', () => {
      // send this to the log eventually
      console.log('Output stream closed.');
      resolve();
    });

    robocopyProcess.stderr.on('data', (data: Buffer | string) => {
      // send this to the log eventually
      console.error(data.toString());
    });

    robocopyProcess.on('close', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`Robocopy closed with code ${code}`);
      resolve();
    });

    robocopyProcess.on('exit', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`robocopyProcess exited with code ${code}`);
      resolve();
    });
  });
}

export function removeDirectory(path: string, isSymlink = false): Promise<void> {
  return new Promise((resolve, reject) => {
    let args;
    if (isSymlink) {
      // idk why this one is different lol
      args = ['/C', 'rd', path];
    } else {
      args = ['/C', 'rd', '/S', '/Q', path];
    }

    const process = child_process.spawn('cmd', args);

    process.stdout.on('data', (data: Buffer | string) => {
      // send this to the log eventually
      console.log(data.toString());
    });

    process.stdout.on('end', () => {
      // send this to the log eventually
      console.log('No more data to read.');
      resolve();
    });

    process.stdout.on('close', () => {
      // send this to the log eventually
      console.log('Output stream closed.');
      resolve();
    });

    process.stderr.on('data', (data: Buffer | string) => {
      console.log(data.toString());
    });

    process.on('close', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`removedirectory closed with code ${code}`);
      resolve();
    });

    process.on('exit', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`removedirectory exited with code ${code}`);
      resolve();
    });
  });
}

export function makeLink(fromPath: string, toPath: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    const process = child_process.spawn('cmd', ['/C', 'mklink', '/J', fromPath, toPath]);

    process.stdout.on('data', (data: Buffer | string) => {
      // send this to the log eventually
      console.log('logging makelink');
      console.log(data.toString());
    });

    process.stdout.on('end', () => {
      // send this to the log eventually
      console.log('No more data to read.');
      resolve();
    });

    process.stdout.on('close', () => {
      // send this to the log eventually
      console.log('Output stream closed.');
      resolve();
    });

    process.stderr.on('data', (data: Buffer | string) => {
      console.log(data.toString());
    });

    process.on('close', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`makelink closed with code ${code}`);
      resolve();
    });

    process.on('exit', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      console.log(`makelink exited with code ${code}`);
      resolve();
    });
  });
}

const GET_DIRECTORY_SIZE_THREADS = 64;
export function getTotalDirectorySize(path: string): Promise<number> {
  return new Promise((resolve, _reject) => {
    const cmd = `cmd /C robocopy /l /nfl /ndl /njh /MT:${GET_DIRECTORY_SIZE_THREADS} "${path}" \\\\localhost\\C$\\nul /e /bytes`;
    console.log(cmd);
    const process = child_process.exec(
      cmd,
      { maxBuffer: 1024 * 1024 * 1024 },
      (_err: string, stdout: string, _stderr: string) => {
        // TODO: pipe the console log to state: console.log(stdout);
        if (stdout.includes('ERROR')) {
          console.error(`Error getting filesize of directory ${path}`);
          return resolve(-1);
        }
        try {
          const bytes = stdout.split('Bytes :')[1].trim().split(' ')[0];
          return resolve(parseInt(bytes, 10));
        } catch (e) {
          console.error(`Unhandled error`, e);
          return resolve(-1);
        }
      }
    );

    process.stdout.on('data', (data: Buffer | string) => {
      // send this to the log eventually
      //console.log('logging getDirectorySize');
      const log = data.toString().trim();
      if (log.startsWith('Bytes')) {
        //console.log(log);
        //resolve();
      }
    });

    process.stdout.on('end', () => {
      // send this to the log eventually
      // console.log('No more data to read.');
      //resolve();
    });

    process.stdout.on('close', () => {
      // send this to the log eventually
      // console.log('Output stream closed.');
      //resolve();
    });

    process.stderr.on('data', (data: Buffer | string) => {
      //console.error(data.toString());
    });

    process.on('close', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      // console.log(`getDirectorySize closed with code ${code}`);
      //resolve();
    });

    process.on('exit', (code: Buffer | string) => {
      // need to find out what happens when it fails lol
      // console.log(`getDirectorySize exited with code ${code}`);
      //resolve();
    });
  });
}
