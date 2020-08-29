const { app, ipcMain } = require('electron');
const homePath = app.getPath('home');
const Datastore = require('nedb');
const { fdir } = require('fdir');

ipcMain.on('walk-directory', (event, arg) => {
  console.log(arg);
  const api = new fdir().withFullPaths().crawl(arg);
  api.withPromise().then((files) => {
    console.log(files);
    event.reply('walk-directory:response', files);
  });
});

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = 'pong';
});

const db = new Datastore({ filename: `${homePath}\\.cargoshift\\.cargoshiftdb`, autoload: true });

ipcMain.on('nedb-upsert', (event, query, update) => {
  db.update(query, update, { upsert: true }, (err, numAffected) => {
    if (err) {
      console.error(err);
    }
    console.log(numAffected);
  });
});

ipcMain.on('nedb-find', (event, query) => {
  db.find(query, (err, docs) => {
    if (err) {
      console.error(err);
    }
    event.returnValue = docs;
  });
});
