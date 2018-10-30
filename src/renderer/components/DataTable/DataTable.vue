<template>

    <div class="snr-data-table" v-loading="loading">
        <div class="snr-data-table-wrap" :style="wrapStyle">
            <data-table-header :columns="columns"
                               :is-sortable="sortable"
                               @update-style="updateWidth"
                               :order="order">
            </data-table-header>

            <div class="data-table-content"
                 :style="contentStyle"
                 ref="contentEl">

                <virtual-list v-show="scrollReady && content.length > 0 && ! loading"
                              :size="rowSize"
                              :remain="remainRows"
                              :bench="rowsBench"
                              v-if="scrollReady"
                              :tobottom="loadMore"
                              class="data-table-content-holder">

                    <data-table-row
                            v-for="(row, index) in content"
                            :key="index"
                            :row="row"
                            :cells-style="cellsStyle"
                            :columns="columns">
                    </data-table-row>

                </virtual-list>

            </div>

            <resize-observer @notify="handleResize" />
        </div>
    </div>

</template>

<script>
    import DataTableHeader from './DataTableHeader';
    import DataTableRow from './DataTableRow';
    import VirtualList from 'vue-virtual-scroll-list';
    import debounce from 'lodash/debounce';

    function getScrollbarWidth() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    }

    export default {

        props: {
            columns: Array,
            content: Array,
            chunksId: {
                type: String,
                required: false,
                default: null
            },
            sortable: {
                type: Boolean,
                default: false
            },
            editable: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            }
        },

        provide() {
            return {
                rootTable: this
            }
        },

        data() {
            return {
                order: {},
                cellsStyle: {},
                rows: this.content,
                scrollReady: false,
                rowSize: 23,
                remainRows: 0,
                contentStyle: {width: '100%'},
                wrapStyle: {
                    width: `calc(100% + ${getScrollbarWidth()}px)`,
                    height: `calc(100% + ${getScrollbarWidth()}px)`
                },
                rowsBench: 0
            }
        },

        watch: {
            content() {

            },

            columns() {
                this.updateList();
                this.resetCellsStyles();
            }
        },

        mounted() {
            this.updateList();

            console.log(this.wrapStyle);
        },

        methods: {
            handleResize: debounce(function() {
                this.updateList();
            }, 150),

            updateList() {
                this.scrollReady = false;
                this.remainRows = Math.floor(this.$refs.contentEl.getBoundingClientRect().height / this.rowSize);
                this.rowsBench = this.remainRows * 4;

                this.$nextTick(() => {
                    this.scrollReady = true;
                });
            },

            resetCellsStyles() {
                this.cellsStyle = {};
            },

            updateCellWidth(cellIndex, width) {
                if(! this.cellsStyle[cellIndex]) {
                    this.$set(this.cellsStyle, cellIndex, {});
                }

                this.$set(this.cellsStyle[cellIndex], 'width', width);
            },

            loadMore() {
                this.$emit('load-next');
            },

            updateWidth(width) {
                this.contentStyle.width = (getScrollbarWidth() + width) + 'px';
            }
        },

        components: {
            DataTableHeader,
            DataTableRow,
            VirtualList
        }

    }

</script>

<style lang="scss">
    @import "../../scss/variables";

    .snr-data-table {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        font-size: 0.85em;
        line-height: 1;
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;

        .snr-data-table-wrap {
            display: flex;
            position: relative;
            overflow-x: scroll;
            overflow-y: auto;
            height: 100%;
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
            flex-grow: 1;
            flex-shrink: 0;
        }

        .data-table-header {
            flex-grow: 0;
            flex-shrink: 0;
        }

        .data-table-content {
            flex-grow: 1;
            flex-shrink: 1;
            overflow: hidden;
        }

        .data-table-row {
            display: flex;
            background-color: white;
            min-width: min-content;
            border-bottom: 1px solid $--table-border-color;

            &:after {
                display: block;
                content: "";
                clear: both;
            }

            &:hover {
                background-color: $--table-current-row-background;
            }

        }

        .row-selector {

        }

        .row-selector {
            width: 28px;
            height: 23px;
        }

        .data-table-content-holder {
            height: 100%;
        }

        .data-table-cell {
            padding: 5px 3px;
            box-sizing: border-box;
            min-width: 25px;
            flex-shrink: 0;
            flex-grow: 0;

            .cell-content {
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break: keep-all;
            }

            &:hover {
                background-color: $--color-primary-light-6;
            }
        }

    }

</style>