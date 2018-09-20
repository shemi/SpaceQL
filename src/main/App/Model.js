import Store from './Store';
import uuid from 'uuid/v4';

const store = Store.instance();
const loaded = {};

class Model {

    constructor(storeKey, data = {}, id = null) {
        this.storeKey = storeKey;
        this.data = data;
        this.id = id;
        this.isNew = (!! id);
        this.isDerty = false;

        if(! this.storeKey) {
            throw new Error('Store key is missing.');
        }

        if(data && typeof data === 'object') {
            this._populate(data, id);
        }

        return new Proxy(this, {
            get(target, key) {
                if(target.hasOwnProperty(key)) {
                    return target[key];
                }

                return target.data[key];
            },
            set(target, key, value) {
                if(target.hasOwnProperty(key)) {
                    target[key] = value;
                    target.isDerty = true;

                    return true;
                }

                target.data[key] = value;
                target.isDerty = true;

                return true;
            }
        });
    }

    fill(data) {
        this.data = data;

        return this;
    }

    _populate(data, id) {
        this.isNew = (!! id);

        this.fill(data);
        this.id = id || uuid();

        this.isDerty = false;
    }

    save() {
        store.set(this._getStoreKey(), this.data);
        this.isNew = false;
        this.isDerty = false;
    }

    _getStoreKey(id = null) {
        id = id || this.id;

        if(! id) {
            throw new Error('ID is missing');
        }

        return `${this.storeKey}.${id}`;
    }

    static get(id) {
        const inst = new this();

        if(! id || typeof id !== 'string') {
            throw new Error("Invalid ID");
        }

        if(loaded[inst.storeKey] && loaded[inst.storeKey][id]) {
            return loaded[inst.storeKey][id];
        }

        let data = store.get(inst.storeKey+'.'+id);

        if(! data) {
            throw new Error(`No ${inst.constructor.name} with the ID: ${id} found.`);
        }

        inst._populate(data, id);

        if(! loaded[inst.storeKey]) {
            loaded[inst.storeKey] = {};
        }

        loaded[inst.storeKey][id] = inst;

        return inst;
    }

    static all() {
        const inst = new this();

        let storeData = store.get(inst.storeKey, {}),
            id,
            instance,
            instances = [];

        if(! loaded[inst.storeKey]) {
            loaded[inst.storeKey] = {};
        }

        for(id in storeData) {
            if(! storeData.hasOwnProperty(id)) {
                continue;
            }

            instance = new this(storeData[id], id);
            loaded[inst.storeKey][id] = instance;
            instances.push(instance);
        }

        return instances;
    }

}

export default Model;