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

        this.inEditMode = false;
        this.isFocused = false;

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

    focus() {
        this.isFocused = true;
    }

    unfocus() {
        this.isFocused = false;
    }

    edit() {
        this.inEditMode = true;
    }

    unedit() {
        this.inEditMode = false;
    }

    deactivate() {
        this.unedit();
        this.unfocus();
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

        this.activeCellIndex = null;
        this.isSelected = false;

        this.setCells(row);
    }

    prevCell(edit = false) {
        let nextIndex = (this.activeCellIndex === null ? 1 : this.activeCellIndex) - 1;

        if(! this.getCurrentCell() || nextIndex < 0) {
            nextIndex = this.cells.length - 1;
        }

        edit ? this.editCell(nextIndex) : this.focusCell(nextIndex);
    }

    nextCell(edit = false) {
        let nextIndex = (this.activeCellIndex === null ? -1 : this.activeCellIndex) + 1;

        if(! this.getCurrentCell() || nextIndex >= this.cells.length) {
            nextIndex = 0;
        }

        edit ? this.editCell(nextIndex) : this.focusCell(nextIndex);
    }

    focusCell(cellIndex) {
        if(! this.cells[cellIndex]) {
            throw new Error(`Cell with the index ${cellIndex} not found in row ${this.__spqlInternalRowId}`);
        }

        if(this.getCurrentCell()) {
            this.getCurrentCell().unfocus();
        }

        this.cells[cellIndex].focus();
        this.activeCellIndex = cellIndex;
        this.isSelected = true;
    }

    editCell(cellIndex) {
        if(! this.cells[cellIndex]) {
            throw new Error(`Cell with the index ${cellIndex} not found in row ${this.__spqlInternalRowId}`);
        }

        if(this.getCurrentCell()) {
            this.getCurrentCell().unedit();
        }

        this.focusCell(cellIndex);
        this.getCurrentCell().edit();
    }

    deactivate() {
        if(this.getCurrentCell()) {
            this.getCurrentCell().deactivate();
        }

        this.activeCellIndex = null;
        this.isSelected = false;
    }

    setCells(row) {
        let column;

        for(column of this.columns.all()) {
            this.cells.push(
                new Cell(column, row[column.key], this.__spqlInternalRowId)
            )
        }
    }

    getCurrentCell() {
        return this.activeCellIndex !== null ? this.cells[this.activeCellIndex] : null;
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