import Vue from "vue";
import Service from './Service';

export default class Stateable {

    constructor() {
        this.state = null;
        this.resetState();
    }

    resetState(keys = null) {
        if(keys) {
            keys = typeof keys === 'string' ? [keys] : keys;

            const defaults = this.constructor.createState();

            for(let key of keys) {
                if(typeof defaults[key] === "undefined") {
                    continue;
                }

                this.setState(key, defaults[key]);
            }

            return;
        }

        Vue.set(this, 'state', this.constructor.createState());
    }

    setState(key, value = null) {
        if(! value && typeof key === 'object') {
            Vue.set(this, 'state', key);

            return;
        }

        const storeKey = this.getStateSettings().storeKey,
            keysToStore = this.getStateSettings().keysToStore;

        if(storeKey && keysToStore.indexOf(key) >= 0) {
            Service.setPreference(`${storeKey}.${key}`, value);
        }

        Vue.set(this.state, key, value);
    }

    getState(key = null, defaultValue = null) {
        if(! key) {
            return this.state;
        }

        let value = this.state[key];

        return value === undefined ? defaultValue : value;
    }

    getStateSettings() {
        return {
            storeKey: this.constructor.name.toLowerCase(),
            keysToStore: []
        }
    }

    static createState() {
        throw new TypeError('This method should be overridden by inheriting classes.');
    }

}