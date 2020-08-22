const electron = window.require('electron');
const child_process = window.require('child_process');

const ROBOCOPY_THREADS = 16;

export function robocopy(source: string, destination: string) {
  return new Promise((resolve, reject) => {
    const robocopyProcess = child_process.spawn('robocopy', [
      '/S',
      '/E',
      `/MT:${ROBOCOPY_THREADS}`,
      '/V',
      source,
      destination,
    ]);

    robocopyProcess.stdout.on('data', (data) => {
      // send this to the log eventually
      console.log(data.toString());
    });

    robocopyProcess.stderr.on('data', (data) => {
      // send this to the log eventually
      console.error(data.toString());
    });

    robocopyProcess.on('close', (code) => {
      // need to find out what happens when it fails lol
      console.log(`Robocopy closed with code ${code}`);
      resolve();
    });

    robocopyProcess.on('exit', (code) => {
      // need to find out what happens when it fails lol
      console.log(`robocopyProcess exited with code ${code}`);
      resolve();
    });
  });
}

export function removeDirectory(path: string, isSymlink = false) {
  return new Promise((resolve, reject) => {
    let process;
    if (isSymlink) {
      // idk why this one is different lol
      process = child_process.spawn('cmd', ['/C', 'rd', path]);
    } else {
      process = child_process.spawn('cmd', ['/C', 'rd', '/S', '/Q', path]);
    }

    process.stdout.on('data', (data) => {
      // send this to the log eventually
      console.log(data.toString());
    });

    process.on('close', (code) => {
      // need to find out what happens when it fails lol
      console.log(`removedirectory closed with code ${code}`);
      resolve();
    });

    process.on('exit', (code) => {
      // need to find out what happens when it fails lol
      console.log(`removedirectory exited with code ${code}`);
      resolve();
    });
  });
}

export function makeLink(fromPath: string, toPath: string) {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn('cmd', ['/C', 'mklink', '/J', fromPath, toPath]);

    process.stdout.on('data', (data) => {
      // send this to the log eventually
      console.log('logging makelink');
      console.log(data.toString());
    });

    process.on('close', (code) => {
      // need to find out what happens when it fails lol
      console.log(`makelink closed with code ${code}`);
      resolve();
    });

    process.on('exit', (code) => {
      // need to find out what happens when it fails lol
      console.log(`makelink exited with code ${code}`);
      resolve();
    });
  });
}
