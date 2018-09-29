import electron from 'electron';
import fs from 'fs';
import path from 'path';
import config from '../../utils/config';
import Cryptr from 'cryptr';
import {get, set, unset} from 'lodash';

const StoreInstances = {};

class Store {

    constructor(file, encrypted = true) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(userDataPath, file);
        this.cryptr = new Cryptr(config.key);
        this.changed = false;
        this.encrypted = encrypted;
        this.saveTimer = null;
        this.saving = false;

        this.data = Store._load(this.path, this.encrypted, this.cryptr);
    }

    get(key, defaultValue = null) {
        return get(this.data, key, defaultValue);
    }

    set(key, value) {
        if(this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        set(this.data, key, value);
        this.changed = true;

        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this.save();
        }, 50);
    }

    remove(key) {
        if(this.saveTimer) {
            clearTimeout(this.saveTimer);
        }

        unset(this.data, key);
        this.changed = true;

        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this.save();
        }, 200);
    }

    save() {
        if(! this.changed || this.saving) {
            return;
        }

        this.saving = true;

        Store._saveFile(
            this.data,
            this.path,
            this.encrypted,
            this.cryptr
        );

        this.changed = false;
        this.saving = false;
    }

    static instance(file = null, encrypted = true) {
        file = (file || config.dataFileName);

        if(StoreInstances[file]) {
            return StoreInstances[file];
        }

        StoreInstances[file] = new Store(file, encrypted);

        return StoreInstances[file];
    }

    static _load(path, encrypted, cryptr) {
        let data = {},
            fileData;

        if(! fs.existsSync(path)) {
            return data;
        }

        try {
            fileData = fs.readFileSync(path);
        }
        catch (err) {
            throw err;
        }

        if(! fileData) {
            throw new Error("Unable to read data file. path: " + path);
        }

        if(encrypted) {
            try {
                fileData = cryptr.decrypt(fileData);
            }
            catch (err) {
                return data;
            }
        }

        try {
            data = JSON.parse(fileData);
        }
        catch (err) {
            throw new Error("Unable to parse data file. path: " + path);
        }

        return data;
    }

    static _saveFile(data, path, encrypted, cryptr) {

        if(typeof data === 'object') {
            data.last_modified = (new Date()).toISOString();
        }

        let dataToStore = JSON.stringify(data);

        if(encrypted) {
            dataToStore = cryptr.encrypt(dataToStore);
        }

        try {
            fs.writeFileSync(path, dataToStore);
        }
        catch (e) {
            return false;
        }

        return true;
    }

}

export default Store;