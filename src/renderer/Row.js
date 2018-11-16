let logged = 1;

class Cell {

    static MAX_DISPLAY_VALUE_LENGTH = 1020;

    constructor(column, originalValue, rowId) {
        this.originalValue = originalValue;
        this.value = originalValue;
        this.displayValue = '';
        this.rowId = rowId;
        this.column = column;

        this.isNullable = this.column.is_nullable;
        this.isJson = false;
        this.displayTag = false;
        this.isDate = false;
        this.isBlob = false;
        this.isText = false;

        this.init();
    }

    init() {
        if(this.isNullable && ! this.originalValue) {
            this.displayTag = 'null';

            return;
        }

        if(this.column.type === 'json') {
            this.isJson = true;
            this.displayValue = Cell.truncateValue(
                JSON.stringify(this.originalValue)
            );

            return;
        }

        if(this.column.is_binary && this.column.is_blob) {
            if(this.column.type === 'blob') {
                this.isBlob = true;
                this.displayTag = 'blob';

                return;
            }
        }

        if(typeof this.originalValue === 'string') {
            this.displayValue = Cell.truncateValue(this.originalValue);
        } else {
            this.displayValue = Cell.truncateValue(
                JSON.stringify(this.originalValue)
            );
        }

    }

    static truncateValue(value) {
        if( !value || typeof value !== 'string' ) {
            return '';
        }

        if(value.length <= Cell.MAX_DISPLAY_VALUE_LENGTH) {
            return value;
        }

        return value.substring(0, Cell.MAX_DISPLAY_VALUE_LENGTH) + '...';
    }

}

export default class Row {

    constructor(row, data) {
        const {columns, table, database} = data;

        this.table = table;
        this.database = database;
        this.columns = columns;
        this.cells = [];
        this.__spqlInternalRowId = row.__spqlInternalRowId;

        this.setCells(row);
    }

    setCells(row) {
        let column;

        for(column of this.columns.all()) {
            this.cells.push(
                new Cell(column, row[column.key], this.__spqlInternalRowId)
            )
        }
    }

    toGrid() {
        let row = {},
            cellIndex;

        for(cellIndex = 0; cellIndex < this.cells.length; cellIndex++) {
            row[this.cells[cellIndex].column.key] = this.cells[cellIndex].displayValue;
        }

        return row;
    }

    static displayCell(column, cell) {
        if(column.is_binary && column.is_blob) {
            if(cell instanceof Uint8Array) {
                cell = Buffer.from(cell);
                cell = cell.toString();
            }

            if(logged <= 2) {
                console.log(column.name, column.type, cell);
                logged++;
            }
        }
    }

}