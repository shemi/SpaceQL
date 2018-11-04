import uuid from 'uuid/v4';
import Preferences from "./Preferences";

class Service {

    constructor(ipc, timeOut = null) {
        this.ipc = ipc;
        this.maxTimeoutMs = timeOut;

        this.ipc.on('getPreferences', Service.getPreferences);
    }

    on(route, listener) {
        this.ipc.on(route, (event, replyChannel, ...dataArgs) => {
            Promise.resolve().then(() => listener(...dataArgs))
                .then((results) => {
                    event.sender.send(replyChannel, 'success', results);
                })
                .catch((e) => {
                    const message = e && e.message ? e.message : e;
                    event.sender.send(replyChannel, 'failure', message);

                    console.error(e);
                });
        });
    }

    send(route, webContents, ...dataArgs) {
        return new Promise((resolve, reject) => {
            const replyChannel = `${route}#${uuid()}`;
            let timeout;
            let didTimeOut = false;

            this.ipc.once(replyChannel, (event, status, returnData) => {
                clearTimeout(timeout);
                if (didTimeOut) {
                    return null;
                }

                switch (status) {
                    case 'success':
                        return resolve(returnData);
                    case 'failure':
                        return reject(new Error(returnData));
                    default:
                        return reject(new Error(`Unexpected IPC call status "${status}" in ${route}`));
                }
            });

            webContents.send(route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs);
            }
        });
    }

    static getPreferences(event, key, defaultValue) {
        event.returnValue = Preferences.instance().get(key, defaultValue);

    }

}

export default Service;