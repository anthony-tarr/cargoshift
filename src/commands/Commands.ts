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
    let args;
    if (isSymlink) {
      // idk why this one is different lol
      args = ['/C', 'rd', path];
    } else {
      args = ['/C', 'rd', '/S', '/Q', path];
    }

    const process = child_process.spawn('cmd', args);

    process.stdout.on('data', (data) => {
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

    process.stderr.on('data', (data) => {
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

    process.stderr.on('data', (data) => {
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
