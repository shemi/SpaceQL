import uuid from 'uuid/v4';
import chunk from 'lodash/chunk';

class RowsChunks {

    static chunkSize = 2000;

    constructor() {
        this.chunks = {};
    }

    create(rows) {
        const id = uuid();
        const rowsChunks = chunk(rows, RowsChunks.chunkSize);

        this.chunks[id] = {
            rows: rowsChunks,
            current: 0
        };

        return {rows: rowsChunks[0], id};
    }

    next(id) {
        const chunk = this.chunks[id];

        if(! chunk || ! chunk.rows) {
            return false;
        }

        let nextIndex = chunk.current + 1;

        if(chunk.rows.length < nextIndex) {
            return false;
        }

        chunk.current = nextIndex;

        return chunk.rows[nextIndex];
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