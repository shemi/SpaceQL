import { ipcRenderer } from 'electron';
import uuid from 'uuid/v4';
import SqlError from "../utils/Exceptions/SqlError";

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

                this.handleResponse(status, returnData, resolve, reject);
            });

            ipcRenderer.send(route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs || 2000);
            }
        });
    }

    sendTo(tabID, route, ...dataArgs) {
        return new Promise((resolve, reject) => {
            const replyChannel = `${route}#${uuid()}`;
            let timeout;
            let didTimeOut = false;

            ipcRenderer.once(replyChannel, (event, status, returnData) => {
                clearTimeout(timeout);

                if (didTimeOut) {
                    return null;
                }

                this.handleResponse(status, returnData, resolve, reject);
            });

            ipcRenderer.sendTo(tabID, route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs);
            }
        });
    }

    on(tabId, route, listener) {
        route = `${tabId}__${route}`;

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

    handleResponse(status, returnData, resolve, reject) {
        switch (status) {
            case 'success':
                return resolve(returnData);
            case 'failure':
                let error = null;

                if(typeof returnData === 'string') {
                    error = new Error(returnData);
                }

                else if(returnData && returnData.sqlMessage) {
                    error = new SqlError(returnData);
                }

                else if(returnData && returnData.message) {
                    error = new Error(returnData.message);
                }

                return reject(error);
            default:
                return reject(new Error(`Unexpected IPC call status "${status}" in ${route}`));
        }
    }

    getPreference(key, defaultValue = null) {
        return ipcRenderer.sendSync('getPreferences', key, defaultValue);
    }

    setPreference(key, value = null) {
        return this.send('PreferencesController@set', key, value);
    }

}

export default (new Service());