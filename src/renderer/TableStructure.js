import Vue from 'vue';
import uuid from 'uuid/v4';

export default class TableStructure {

    static arrayWithObjectsKeys = ['columns', 'indexes'];

    constructor(tableKeyMap) {
        this._originalTableKeyMap = tableKeyMap;
        this._form = {};
        this._formChanges = {};

        this.buildForm();
    }

    update(tableKeyMap) {
        this._originalTableKeyMap = tableKeyMap;
        this.buildForm();
    }

    reset() {
        this._form = {};
        this._formChanges = {};
        this.buildForm();
    }

    buildForm() {
        for (let key of Object.keys(this._originalTableKeyMap)) {
            if(TableStructure.arrayWithObjectsKeys.indexOf(key) >= 0) {
                Vue.set(this._form, key, []);

                for(let item of this._originalTableKeyMap[key]) {

                    if(key === 'columns') {
                        this.pushColumn(item);
                    }
                }
            }

            else {
                Vue.set(this._form, key, this._originalTableKeyMap[key]);
            }

            Vue.set(this._formChanges, key, false);
        }
    }

    pushColumn(rawData) {
        rawData.__spqlInternalId = uuid();

        this._form.columns.push(this.wrapWithProxy(rawData, 'columns'));
    }

    wrapWithProxy(target, parentKey) {
        return new Proxy(target, {
            get(target, key) {
                return target[key];
            },
            set: (target, key, value) => {
                Vue.set(target, key, value);

                return true;
            }
        })
    }

    get changed() {
        for(let key of Object.keys(this._formChanges)) {
            if(this._formChanges[key]) {
                return true;
            }
        }

        return false;
    }

    get form() {
        return new Proxy(this._form, {
            get(target, key) {
                return target[key];
            },
            set: (target, key, value) => {
                Vue.set(this._formChanges, key, this._originalTableKeyMap[key] !== value);
                Vue.set(target, key, value);

                console.log('change: ' + key, this._formChanges[key]);

                return true;
            }
        })
    }

}