<template>

    <div class="data-table-row" tabindex="-1">
        <div class="row-selector">
        </div>

        <data-table-cell v-for="(column, index) in columns"
                         :key="tableId + row.__spqlInternalRowId + column.key"
                         :row-index="rowIndex"
                         :cell-index="index"
                         :cell-style="cellsStyle"
                         :editable="editable"
                         @click.native="focus($event, index)"
                         @dblclick.native="edit($event, index)"
                         :cell="row.cells[index]">
        </data-table-cell>

    </div>

</template>

<script>
    import { IdState } from 'vue-virtual-scroller';
    import DataTableCell from './DataTableCell';

    export default {
        mixins: [
            IdState({
                idProp: vm => vm.row.__spqlInternalRowId,
            }),
        ],

        props: {
            tableId: String,
            columns: Array,
            row: Object,
            cellsStyle: Object,
            rowIndex: Number,
            editable: Boolean
        },

        idState () {
            return {

            }
        },

        methods: {

            edit($e, index) {
                this.row.editCell(index);
                this.$emit('enter-edit-mode', index);
            },

            focus($e, index) {
                this.row.focusCell(index);
                this.$emit('is-focused', index);
            }

        },

        components: {
            DataTableCell
        }

    }

</script>