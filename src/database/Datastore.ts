const electron = window.require('electron');
const { ipcRenderer } = electron;

class Datastore {

  public upsert(query: any, update: any) {
    ipcRenderer.send('nedb-upsert', query, update);
  }

  public insert() {
    // console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"
    // ipcRenderer.on('asynchronous-reply', (_event: any, arg: any) => {
    //   console.log(arg); // prints "pong"
    // });
    // ipcRenderer.send('asynchronous-message', 'ping');
  }

  public addToLinkList(source: string, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ipcRenderer.on('nedb-insert:result', (_event, arg) => {
        resolve(arg);
      });

      const query = { type: 'link', source, destination };
      ipcRenderer.send('nedb-insert', query);
    });
  }

  removeFromLinkList(source: string, destination: string) {
    return new Promise((resolve, reject) => {
      ipcRenderer.on('nedb-delete:result', (_event, arg) => {
        resolve(arg);
      });

      const query = { type: 'link', source, destination };
      ipcRenderer.send('nedb-delete', query);
    });
  }

  public retrieveAllLinks(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      ipcRenderer.on('nedb-findasync:result', (_event, arg) => {
        resolve(arg);
      });

      const query = { type: 'link' };
      ipcRenderer.send('nedb-findasync', query);
    });
  }

  public find(query: any) {
    const result = ipcRenderer.sendSync('nedb-find', query);
    return result;
  }
}

export default Datastore;
