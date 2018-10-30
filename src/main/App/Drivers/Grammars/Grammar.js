import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';

export default class Grammar {

    static selectComponents = [
        'columns',
        'from',
        'wheres',
        'orders',
        'limit'
    ];

    constructor(tablePrefix = '') {
        this.tablePrefix = tablePrefix;
        this.values = [];
    }

    compileSelect(query) {
        const original = query.columns;

        if(! query.columns || query.columns.length <= 0) {
            query.columns = ['*'];
        }

        let sql = this.compileComponents(query);

        query.columns = original;

        return sql;
    }

    compileComponents(query) {
        let sql = [];

        for(let component of Grammar.selectComponents) {
            let method = 'compile'+upperFirst(component);

            if(! isEmpty(component) && typeof this[method] === 'function') {
                sql.push(this[method](query, query[component]));
            }
        }

        return sql.join(' ');
    }

    compileColumns(query, columns) {
        return 'select '+this.columnize(columns);
    }

    columnize(columns) {
        return columns.map(this.wrap.bind(this)).join(', ');
    }

    wrap(value) {
        if (value.indexOf(' as ') >= 0) {
            return this.wrapAliasedValue(value);
        }

        return this.wrapSegments(value.split('.'));
    }

    wrapAliasedValue(value) {
        let segments = value.split(/\s+as\s+/i);

        return this.wrap(segments[0])+' as '+this.wrapValue(segments[1]);
    }

    wrapValue(value) {
        if (value !== '*') {
            return '"'+ value.replace(/"/g, '""') +'"';
        }

        return value;
    }

    wrapSegments(segments) {
        return segments.map((segment, key) => {
            return key === 0 && segments.length > 1
                ? this.wrapTable(segment)
                : this.wrapValue(segment);
        }).join('.');
    }

    wrapTable(table)
    {
        return this.wrap(this.tablePrefix+table);
    }

    compileFrom(query, table) {
        return 'from '+this.wrapTable(table);
    }

    compileWheres(query, wheres) {
        if(! wheres || wheres.length <= 0) {
            return '';
        }

        return 'where ' + wheres.map((whereObject, index) => {
            let sql = '';

            if(index !== 0) {
                sql += ' '+whereObject.bool+' ';
            }

            this.values.push(whereObject.value);

            return sql + this.wrap(whereObject.column) + ' ' + whereObject.operator + ' ?';
        }).join(' ');
    }

    compileOrders(query, orders) {
        if(! orders || orders.length <= 0) {
            return '';
        }

        return 'order by ' + this.compileOrdersToArray(query, orders).join(', ');
    }

    compileOrdersToArray(query, orders) {
        return orders.map((order) => {
            return this.wrap(order.column) + ' ' + order.direction;
        });
    }

    setTablePrefix(prefix) {
        this.tablePrefix = prefix;

        return this;
    }

    compileLimit(query, limit) {
        if(! limit) {
            return '';
        }

        return 'limit ' + parseInt(limit);
    }

}