import uuid from 'uuid/v4';

export default class Tab {

    constructor(data) {
        let {id, connection, position,
            table, favorite, query} = data;

        this.id = id || uuid();
        this.connection = connection || {};
        this.table = table || null;
        this.favorite = favorite || {};
        this.query = query || '';
        this.isActive = false;
        this.name = this.favorite.name || this.connection.name;
        this.color = this.favorite.color || null;
        this.position = position || 0;

        this.nameDuplication = 0;
    }

    activate() {
        if(! this.connection.id) {
            return;
        }

        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    setDuplications(number) {
        this.nameDuplication = number;
    }

    displayName() {
        let name = '';

        if(this.nameDuplication > 0) {
            name += `#${this.nameDuplication} `;
        }

        if(this.table) {
            name += this.table + ' - ';
        }

        return name + this.name;
    }

}