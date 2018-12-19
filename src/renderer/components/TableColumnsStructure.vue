<template>

    <div class="spql-table-columns-structure-container" :style="{height}">
        <data-table :columns="columns.all()"
                    :content="rows.all()"
                    ref="datatable"
                    editable>
        </data-table>
    </div>

</template>

<script>
    import DataTable from './DataTable/DataTable';
    import Column from "../Column";
    import RowCollection from "../RowCollection";
    import ColumnsCollection from "../ColumnsCollection";

    export default {
        props: {
            table: Object
        },

        data() {
            return {
                columns: new ColumnsCollection(),
                rows: new RowCollection(),
                height: 'auto'
            }
        },

        watch: {
            table: {
                handler(newTable, oldTable) {
                    this.updateRows();
                },
                immediate: true
            }
        },

        mounted() {
            this.$nextTick(() => {
                this.height = this.$el.clientHeight + 'px';
            });

            this.columns.collect([
                Column.createForStructure('name', 'Field', 'varchar', ''),
                Column.createForStructure('type', 'Data Type', 'varchar', ''),
                Column.createForStructure('length', 'Length', 'varchar', ''),
                Column.createForStructure('is_unsigned', 'Unsigned', 'tinyint'),
                Column.createForStructure('is_zerofill', 'Zerofill', 'tinyint'),
                Column.createForStructure('is_nullable', 'Allow Null', 'tinyint'),
                Column.createForStructure('key', 'Key', 'varchar'),
                Column.createForStructure('default_value', 'Default', 'varchar'),
                Column.createForStructure('extra', 'Extra', 'varchar'),
                Column.createForStructure('collation', 'Collation', 'varchar'),
                Column.createForStructure('comment', 'Comment', 'varchar'),
            ]);

            this.rows.setDriver({
                columns: this.columns,
                table: '__spl_table_structure_table',
                database: '__spl_table_structure_column',
            });

            this.updateRows();
        },

        methods: {

            updateRows() {
                if(! this.rows.driver || ! this.table) {
                    return;
                }

                this.rows.collect(this.table.columns);
            }

        },

        components: {
            DataTable
        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .spql-table-columns-structure-container {
        height: 100%;
        flex-grow: 1;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;

        > div {
            flex-grow: 1;
            flex-shrink: 0;
        }
    }

</style>