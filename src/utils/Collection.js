import baseCollection from 'lodash/collection';

export default class Collection
{

    constructor(items = [], driver = null) {
        this.collect(items);
        this.driver = driver;
    }

    collect(items) {
        this.items = [];
        items = Array.isArray(items) ? items : [items];

        for (let item of items) {
            this.push(item);
        }

        return this;
    }

    setDriver(driver) {
        this.driver = driver;

        return this;
    }

    countBy(callback) {
        return baseCollection.countBy(this.items, callback);
    }

    each(callback) {
        baseCollection.each(this.items, callback);

        return this;
    }

    evry(predicate, guard = null) {
        return baseCollection.every(this.items, predicate, guard);
    }

    find(predicate, fromIndex = 0) {
        return baseCollection.find(this.items, predicate, fromIndex);
    }

    first(predicate = null) {
        if(! predicate) {
            return this.items.length > 0 ? this.items[0] : null;
        }

        return this.find(predicate);
    }

    where(predicate) {
        return new this(baseCollection.filter(this.items, predicate), this.driver);
    }

    findLast(predicate, fromIndex = 0) {
        return baseCollection.findLast(this.items, predicate, fromIndex);
    }

    flatMap(callback) {
        return new this(baseCollection.flatMap(this.items, callback), this.driver);
    }

    flatMapDeep(callback) {
        return new this(baseCollection.flatMapDeep(this.items, callback), this.driver);
    }

    groupBy(callback) {
        return baseCollection.groupBy(this.items, callback);
    }

    has(value, fromIndex = 0, guard = null) {
        return baseCollection.includes(this.items, value, fromIndex, guard);
    }

    keyBy(callback) {
        return baseCollection.keyBy(this.items, callback);
    }

    pluck(callback) {
        return baseCollection.map(this.items, callback);
    }

    orderBy(callback, orders = null) {
        this.items = baseCollection.orderBy(this.items, callback, orders);

        return this;
    }

    reject(predicate) {
        this.items = baseCollection.reject(this.items, predicate);

        return this;
    }

    count() {
        return this.items.length;
    }

    push(item) {
        this.items.push(item);

        return this;
    }

    merge(items) {
        items = Array.isArray(items) ? items : [items];

        for(let item of items) {
            this.push(item);
        }

        return this;
    }

    all() {
        return this.items;
    }

    isEmpty() {
        return this.count() <= 0;
    }

    isNotEmpty() {
        return ! this.isEmpty();
    }

    toRenderer() {
        let items = [],
            item;

        for(item of this.items) {
            if(typeof item.toRenderer === 'function') {
                items.push(item.toRenderer());
            } else {
                items.push(item);
            }
        }

        return items;
    }

}