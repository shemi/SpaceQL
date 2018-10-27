import uuid from 'uuid/v4';

class Service {

    constructor(ipc, maxTimeoutMs = null) {
        this.ipc = ipc;
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

            this.ipc.send(route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs);
            }
        });
    }

    on(route, listener) {
        console.log(route);
        this.ipc.on(route, (event, replyChannel, ...dataArgs) => {
            console.log('call: ' + route);
            Promise.resolve().then(() => listener(...dataArgs))
                .then((results) => {
                    this.ipc.sendTo(1, replyChannel, 'success', results);
                })
                .catch((e) => {
                    console.dir(e);

                    this.ipc.sendTo(1, replyChannel, 'failure', e);
                });
        });
    }

}

export default Service;