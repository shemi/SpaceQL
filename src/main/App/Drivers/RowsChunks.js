import uuid from 'uuid/v4';
import chunk from 'lodash/chunk';

class RowsChunks {

    static chunkSize = 2000;

    constructor() {
        this.chunks = {};
        this.chunkColumns = {};
    }

    create(rows) {
        const id = uuid();

        this.chunks[id] = chunk(rows, RowsChunks.chunkSize);

        rows = this.next(id);

        return {rows, id};
    }

    next(id) {
        if(! this.chunks[id] || this.chunks[id].length <= 0) {
            return false;
        }

        return this.chunks[id].shift();
    }

    clear(id) {
        if(! this.chunks[id]) {
            return false;
        }

        delete this.chunks[id];

        return true;
    }

    getRowsPerChunk() {
        return RowsChunks.chunkSize;
    }

}

export default (new RowsChunks);