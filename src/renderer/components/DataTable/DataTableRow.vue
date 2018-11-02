<template>

    <div class="data-table-row">
        <div class="row-selector">

        </div>

        <data-table-cell v-for="(column, index) in columns"
                         :key="tableId + row.__spqlInternalRowId + column.name"
                         :row-index="rowIndex"
                         :cell-index="index"
                         :column="column"
                         :cell-style="cellsStyle"
                         :value="row[column.name]">

        </data-table-cell>

    </div>

</template>

<script>
    import { IdState } from 'vue-virtual-scroller';
    import DataTableCell from './DataTableCell';

    export default {
        mixins: [
            IdState({
                // You can customize this
                idProp: vm => vm.row.__spqlInternalRowId,
            }),
        ],

        props: {
            tableId: String,
            columns: Array,
            row: Object,
            cellsStyle: Object,
            rowIndex: Number
        },

        idState () {
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