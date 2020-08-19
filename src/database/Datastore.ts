const electron = window.require('electron');
const { ipcRenderer } = electron;

class Datastore {
  public upsert(query: any, update: any) {
    ipcRenderer.send('nedb-upsert', query, update);
  }

  public insert() {
    console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg); // prints "pong"
    });

    ipcRenderer.send('asynchronous-message', 'ping');
  }

  public find(query: any) {
    const result = ipcRenderer.sendSync('nedb-find', query);
    return result;
  }
}

export default Datastore;
