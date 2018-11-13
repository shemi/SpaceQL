import knex from 'knex';

export default class QueryBuilder {

    constructor(driver) {
        this.driver = driver;
        this.knex = knex({
            client: this.driver.constructor.CLIENT,
            version: `${driver.MAJOR}.${driver.MINOR}`,
        });

        return new Proxy(this, {
            get(target, propKey, receiver) {
                if(target[propKey] !== undefined) {
                    if(typeof target[propKey] === "function") {
                        return function(...args) {
                            return target[propKey].apply(this, args);
                        }
                    }

                    return target[propKey];
                }

                const knexProp = target.knex[propKey];

                if(knexProp === undefined) {
                    throw new Error("the prop/method " + propKey + " not found on QueryBuilder");
                }

                if(typeof knexProp !== 'function') {
                    return knexProp;
                }

                return function(...args) {
                    target.knex = knexProp.apply(target.knex, args);

                    return this;
                }
            }
        });
    }

    use(database) {
        this.knex.withSchema(database);

        return this;
    }

    take(number) {
        this.knex.limit(number);

        return this;
    }

    async first() {
        return await this.take(1).get();
    }

    async get() {
        return await this.driver.query(this);
    }

}