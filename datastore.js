const { app, ipcMain } = require('electron');
const homePath = app.getPath('home');
const Datastore = require('nedb');
const { monitorEventLoopDelay } = require('perf_hooks');

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = 'pong';
});

const db = new Datastore({ filename: `${homePath}\\.cargoshift\\.cargoshiftdb`, autoload: true });

ipcMain.on('nedb-upsert', (_event, query, update) => {
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

ipcMain.on('nedb-findasync', (event, query) => {
  db.find(query, (err, docs) => {
    if (err) {
      console.error(err);
    }
    event.reply('nedb-findasync:result', docs);
  });
});

ipcMain.on('nedb-insert', (event, query) => {
  db.insert(query, (err, doc) => {
    if (err) {
      console.error(err);
    }

    event.reply('nedb-insert:result', doc);
  });
});
ipcMain.on('nedb-delete', (event, query) => {
  db.remove(query, {}, (err, numRemoved) => {
    if (err) {
      console.error(err);
    }

    event.reply('nedb-delete:result', numRemoved);
  });
});
