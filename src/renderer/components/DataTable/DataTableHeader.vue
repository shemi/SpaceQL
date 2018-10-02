<template>

    <div class="data-table-header">

        <div class="data-table-row data-table-header-row">
            <div class="row-selector">

            </div>

            <div v-for="(column, index) in columns"
                 ref="cells"
                 :key="column.name"
                 :data-cell-key="'cell_'+index+'_'+column.name"
                 class="data-table-cell data-table-header-cell">
                <div class="cell-content">{{ column.name }}</div>

                <span class="caret-wrapper" v-if="isSortable">
                    <span class="caret-holder">
                        <i class="sort-caret ascending"></i><i class="sort-caret descending"></i>
                    </span>
                </span>

                <div class="resize-handler"></div>
            </div>

        </div>

    </div>

</template>

<script>

    export default {

        props: {
            isSortable: Boolean,
            columns: Array,
            order: Object
        },

        inject: ['rootTable'],

        data() {
            return {
                currentResizeableCell: null,
                cellsStyle: {

                }
            }
        },

        watch: {
            columns: {
                handler(table) {
                    this.$nextTick(() => {
                        this.init();
                    });
                },
                deep: true,
                immediate: true
            }
        },

        methods: {
            init() {
                if(! this.columns || ! this.columns.length) {
                    return;
                }

                for(let columnIndex in this.columns) {
                    const cell = this.$refs['cells'][columnIndex];

                    this.updateCellWidth(columnIndex, cell.getBoundingClientRect().width+'px');
                }

                this.initResize();
            },

            initResize() {
                const cells = this.$refs.cells;
                const self = this;

                if(! cells) {
                    return;
                }

                for (let i = 0;i < cells.length; i++) {
                    const currentCell = cells[i],
                        currentResizeHandler = currentCell.querySelector('.resize-handler');

                    currentResizeHandler.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        window.addEventListener('mousemove', resize);
                        window.addEventListener('mouseup', stopResize);
                    });

                    function resize(e) {
                        self.$nextTick(() => {
                            self.updateCellWidth(i, e.pageX - currentCell.getBoundingClientRect().left + 'px');
                        });
                    }

                    function stopResize() {
                        window.removeEventListener('mousemove', resize)
                    }
                }
            },

            updateCellWidth(columnIndex, width) {
                const cellElement = this.$refs['cells'][columnIndex];

                cellElement.style.width = width;
                this.rootTable.updateCellWidth(columnIndex, width);
            }

        }

    }

</script>

<style lang="scss">
    @import "../../scss/variables";

    $--color-data-table-border: rgba(black, 0.3);

    .snr-data-table .data-table-header {

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
        }

    }

</style>