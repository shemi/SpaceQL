<template>

    <div class="data-table-row">
        <div class="row-selector">

        </div>

        <data-table-cell v-for="(column, index) in columns"
                         :key="column.name"
                         :row-index="rowIndex"
                         :cell-index="index"
                         :cell-style="cellsStyle"
                         :value="row[column.name]"></data-table-cell>

    </div>

</template>

<script>
    import DataTableCell from './DataTableCell';

    export default {

        props: {
            columns: Array,
            row: Object,
            cellsStyle: Object,
            rowIndex: Number
        },

        data() {
            return {

            }
        },

        methods: {

        },

        components: {
            DataTableCell
        }

    }

</script>