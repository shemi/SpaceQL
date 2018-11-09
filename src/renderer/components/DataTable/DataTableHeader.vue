<template>

    <div class="data-table-header">

        <div class="data-table-row data-table-header-row" ref="headerRow">
            <div class="row-selector">

            </div>

            <data-table-header-cell
                v-for="(column, index) in columns"
                ref="cells"
                :key="index+column.name"
                :column="column"
                :index="index"
                :order="newOrder"
                @click.native="handelOrder(column)"
                :is-sortable="isSortable"
            >
            </data-table-header-cell>

        </div>

    </div>

</template>

<script>
    import DataTableHeaderCell from './DataTableHeaderCell';

    export default {

        props: {
            isSortable: Boolean,
            columns: Array,
            order: Object
        },

        inject: ['rootTable'],

        data() {
            return {
                newOrder: this.order || {},
                currentResizeableCell: null,
                observer: null
            }
        },

        mounted() {
            this.observer = new MutationObserver((mutationsList, observer) => {
                for(let mutation of mutationsList) {
                    if(mutation.attributeName === 'style') {
                        this.$emit('update-style', this.$refs.headerRow.clientWidth);
                    }
                }
            });

            this.observer.observe(this.$refs.headerRow, {
                attributes: true,
                childList: false,
                subtree: true
            });
        },

        beforeDestroy() {
            if(this.observer) {
                this.observer.disconnect();
            }
        },

        watch: {
            order: {
                handler(order) {
                    this.newOrder = order;
                },
                deep: true
            },
            columns: {
                handler(newColumns, oldColumns) {

                },
                deep: true,
                immediate: true
            }
        },

        methods: {

            handelOrder(column) {
                if(! this.isSortable) {
                    return;
                }

                if(column.name !== this.newOrder.column) {
                    this.$set(this.newOrder, 'direction', null);
                }

                this.$set(this.newOrder, 'column', column.key);

                if(this.newOrder.direction === 'desc') {
                    this.$set(this.newOrder, 'direction', null);
                } else {
                    this.$set(this.newOrder, 'direction', this.newOrder.direction === 'asc' ? 'desc' : 'asc');
                }

                this.$emit('on-order', this.newOrder);
            },

            updateCellWidth(columnIndex, width) {
                const cellElement = this.$refs['cells'][columnIndex];

                cellElement.style.width = width;
                this.rootTable.updateCellWidth(columnIndex, width);
            }

        },

        computed: {
            rowStyle() {
                return {

                }
            }
        },

        components: {
            DataTableHeaderCell
        }

    }

</script>

<style lang="scss">
    @import "../../scss/variables";

    $--color-data-table-border: rgba(black, 0.3);

    .snr-data-table .data-table-header {
        cursor: default;
        user-select: none;

        .data-table-header-row {
            background-color: $--table-header-background;
            border-top: 1px solid rgba($--color-data-table-border, 0.1);
            border-bottom: 1px solid $--color-data-table-border;
        }

        .data-table-header-cell {
            position: relative;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-right: 28px;
            font-weight: bold;

            .resize-handler {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 9px;
                border-right: 1px solid $--table-border-color;
                cursor: col-resize;
            }
        }

        .row-selector {
            height: 33px;
        }

        .caret-wrapper {
            display: block;
            height: 34px;
            width: 24px;
            overflow: initial;
            position: absolute;
            right: 0px;
            top: 50%;
            transform: translateY(-50%);

            .caret-holder {
                display: inline-flex;
                position: relative;
                height: 34px;
                width: 24px;
                vertical-align: middle;
                flex-direction: column;
                align-items: center;
            }

            .sort-caret {
                width: 0;
                height: 0;
                border: 5px solid transparent;
                position: absolute;
                left: 7px;
            }

            .sort-caret.ascending {
                border-bottom-color: #c0c4cc;
                top: 5px;
            }

            .sort-caret.descending {
                border-top-color: #c0c4cc;
                bottom: 7px;
            }

            .ascending .sort-caret.ascending {
                border-bottom-color: $--color-primary;
            }

            .descending .sort-caret.descending {
                border-top-color: $--color-primary;
            }
        }

    }

</style>