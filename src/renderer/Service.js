import { ipcRenderer } from 'electron';
import uuid from 'uuid/v4';

class Service {

    constructor(maxTimeoutMs = null) {
        this.maxTimeoutMs = maxTimeoutMs;
    }

    setMaxTimeoutMs(maxTimeoutMs) {
        this.maxTimeoutMs = maxTimeoutMs;

        return this;
    }

    send(route, ...dataArgs) {
        return new Promise((resolve, reject) => {
            const replyChannel = `${route}#${uuid()}`;
            let timeout;
            let didTimeOut = false;

            ipcRenderer.once(replyChannel, (event, status, returnData) => {
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

            ipcRenderer.send(route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs);
            }
        });
    }

    on(route, listener) {
        ipcRenderer.on(route, (event, replyChannel, ...dataArgs) => {
            Promise.resolve().then(() => listener(...dataArgs))
                .then((results) => {
                    ipcRenderer.send(replyChannel, 'success', results);
                })
                .catch((e) => {
                    const message = e && e.message ? e.message : e;

                    ipcRenderer.send(replyChannel, 'failure', message);
                });
        });
    }

}

export default (new Service());