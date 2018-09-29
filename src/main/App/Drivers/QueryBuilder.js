export default class QueryBuilder {

    static operators = [
        '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
        'like', 'like binary', 'not like', 'ilike',
        '&', '|', '^', '<<', '>>',
        'rlike', 'regexp', 'not regexp',
        '~', '~*', '!~', '!~*', 'similar to',
        'not similar to', 'not ilike', '~~*', '!~~*',
    ];

    constructor(driver) {
        this.driver = driver;
        this.databse = '';

        this.table = '';
        this.columns = ['*'];
        this.wheres = [];
        this.orders = [];
        this.rowsLimit = null;

    }

    use(database) {
        this.databse = database;

        return this;
    }

    from(name) {
        this.table = name;

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
        this.orders.push({
            column,
            direction: direction.toLowerCase() === 'asc' ? 'asc' : 'desc'
        });

        return this;
    }

    limit(limit) {
        if(limit) {
            this.rowsLimit = limit;
        }

        return this;
    }

    async first() {
        return await this.limit(1).get();
    }

    async get() {
        return await this.driver.select(this);
    }

}