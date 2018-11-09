import {BUILDER_OPRATORS} from "../../../utils/constants";

export default class QueryBuilder {

    static operators = BUILDER_OPRATORS;

    constructor(driver) {
        this.driver = driver;
        this.databse = '';

        this.from = '';
        this.columns = ['*'];
        this.wheres = [];
        this.orders = [];
        this.limit = null;

    }

    use(database) {
        this.databse = database;

        return this;
    }

    table(name) {
        this.from = name;

        return this;
    }

    select(names = ['*']) {
        this.columns = Array.isArray(names) ? names : [names];

        return this;
    }

    where(column, operator, value, bool = 'and') {
        this.wheres.push({column, operator, value, bool});

        return this;
    }

    orWhere(column, operator, value) {
        return this.where(column, operator, value, 'or');
    }

    orderBy(column, direction = 'asc') {
        direction = direction || 'asc';

        this.orders.push({
            column,
            direction: direction.toLowerCase() === 'asc' ? 'asc' : 'desc'
        });

        return this;
    }

    take(limit) {
        if(limit) {
            this.limit = limit;
        }

        return this;
    }

    async first() {
        return await this.limit(1).get();
    }

    async get() {
        return await this.driver.query(this);
    }

}