import {BrowserWindow} from 'electron';

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/dist/electron/tab.html`
    : `file://${__dirname}/tab.html`;

let instance;

class Tabs {

    constructor() {
        this.tabs = {};
    }

    create() {
        return new Promise((resolve, reject) => {
            const tab = new BrowserWindow({show: false});
            const tabId = tab.id;

            tab.loadURL(winURL);
            this.tabs[tabId] = tab;
            resolve(tabId);

            tab.on('closed', () => {
                delete this.tabs[tabId];
            });
        });
    }

    getTab(tabId) {
        if(! this.tabs[tabId]) {
            throw new Error("Tab with the id " + tabId + " not found.");
        }

        return this.tabs[tabId];
    }

    close(id, testLast = true) {
        let tab = this.getTab(id);

        if(testLast && Object.keys(this.tabs).length <= 1) {
            throw new Error("Cant close the last Tab");
        }

        tab.close();
    }

    closeAll() {
        for(let tabId of Object.keys(this.tabs)) {
            this.close(tabId, false);
        }
    }

    static instance() {
        if(! instance) {
            instance = new Tabs;
        }

        return instance;
    }

}

export default Tabs;