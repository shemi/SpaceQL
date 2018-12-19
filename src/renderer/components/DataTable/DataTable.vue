<template>

    <scrollbar ref="scrollbar">
        <div class="snr-data-table" v-loading="loading">
            <div class="snr-data-table-wrap"
                 @scroll="handleScroll"
                 ref="widthElement"
                 :style="wrapStyle">

                <data-table-header :columns="columns"
                                   :is-sortable="sortable"
                                   @update-style="updateWidth"
                                   @on-order="handelOrder"
                                   :order="order">
                </data-table-header>

                <div class="data-table-content"
                     :style="contentStyle"
                     tabindex="0"
                     ref="contentEl">

                        <recycle-scroller
                                class="data-table-content-holder"
                                :items="content"
                                :item-height="rowSize"
                                ref="heightElement"
                                @scroll.native="handleScroll"
                                keyField="__spqlInternalRowId"
                                :buffer="rowsBench">

                            <data-table-row
                                slot-scope="{item, index}"
                                :row="item"
                                :table-id="randomId"
                                :cells-style="cellsStyle"
                                :editable="editable"
                                @enter-edit-mode="chaneActiveRow($event, index)"
                                @is-focused="chaneActiveRow($event, index)"
                                :columns="columns">
                            </data-table-row>

                        </recycle-scroller>

                </div>

                <resize-observer @notify="handleResize" />
            </div>
        </div>
    </scrollbar>

</template>

<script>
    import {on, off} from 'element-ui/src/utils/dom';
    import uuid from 'uuid/v4';
    import DataTableHeader from './DataTableHeader';
    import DataTableRow from './DataTableRow';
    import VirtualList from 'vue-virtual-scroll-list';
    import debounce from 'lodash/debounce';
    import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
    import Scrollbar from './Scrollbar/main';
    import RecycleScroller from "vue-virtual-scroller/src/components/RecycleScroller";
    import {getTargetScrollLocationX, getTargetScrollLocationY} from "./getTargetScrollLocation";

    const SCROLL_BOTTOM_OFFSET = 200;

    export default {

        props: {
            columns: Array,
            content: Array,
            order: Object,
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
            },
            scrollPos: {
                type: Object,
                default: () => ({top: 0, left: 0})
            }
        },

        provide() {
            return {
                rootTable: this
            }
        },

        data() {
            return {
                randomId: uuid(),
                cellsStyle: {},
                rows: this.content,
                scrollReady: false,
                rowSize: 26,
                remainRows: 0,
                contentStyle: {width: '100%'},
                wrapStyle: {
                    width: `calc(100% + ${scrollbarWidth()}px)`,
                    height: `calc(100% + ${scrollbarWidth()}px)`
                },
                rowsBench: 0,
                activeRowIndex: null
            }
        },

        watch: {

            columns() {
                this.resetCellsStyles();
                this.updateList();
            }
        },

        mounted() {
            this.updateList();

            on(document, 'keydown', this.onKeypress);
        },

        methods: {
            handleResize: debounce(function() {
                this.updateList();
            }, 150),

            chaneActiveRow($e, index) {
                if(this.activeRowIndex === index) {
                    return;
                }

                if(this.activeRowIndex !== null && this.content[this.activeRowIndex]) {
                    this.content[this.activeRowIndex].deactivate();
                }

                this.activeRowIndex = index;
            },

            handleScroll(e) {
                let scrollTop,
                    scrollPos,
                    scrollHeight;

                if(this.$refs.scrollbar) {
                    this.$refs.scrollbar.handleScroll(e);
                }

                if(! this.heightElement || ! this.widthElement) {
                    return;
                }

                scrollTop = this.heightElement.scrollTop;
                scrollPos = scrollTop + this.heightElement.offsetHeight;
                scrollHeight = this.heightElement.scrollHeight;

                if((scrollHeight - scrollPos) < SCROLL_BOTTOM_OFFSET) {
                    this.$emit('load-next');
                }

                this.$emit('scroll', {
                    top: this.heightElement.scrollTop,
                    left: this.widthElement.scrollLeft,
                });
            },

            onKeypress($event) {
                let key = $event.key,
                    rowIndex = this.activeRowIndex || 0,
                    nextRow,
                    activeCell = 0;

                if($event.shiftKey) {
                    key = 'Shift' + key;
                }

                if($event.ctrlKey) {
                    key = 'Ctrl' + key;
                }

                switch (key) {
                    case 'ArrowUp':
                        nextRow = (rowIndex === null ? this.content.length : rowIndex) - 1;
                        activeCell = 0;

                        if(nextRow < 0) {
                            nextRow = this.content.length - 1;
                            this.heightComponent.scrollToItem(nextRow);
                        }

                        if(this.content[rowIndex || 0]) {
                            activeCell = this.content[rowIndex].activeCellIndex;
                        }

                        this.content[nextRow].focusCell(activeCell);
                        this.chaneActiveRow($event, nextRow);

                        break;
                    case 'ArrowDown':
                        nextRow = (rowIndex === null ? -1 : rowIndex) + 1;
                        activeCell = 0;

                        if(nextRow >= this.content.length) {
                            nextRow = 0;
                            this.heightComponent.scrollToItem(nextRow);
                        }

                        if(this.content[rowIndex || 0]) {
                            activeCell = this.content[rowIndex].activeCellIndex;
                        }

                        this.content[nextRow].focusCell(activeCell);
                        this.chaneActiveRow($event, nextRow);

                        break;
                    case 'ShiftTab':
                    case 'ArrowLeft':
                        if(! this.content[rowIndex]) {
                            return;
                        }

                        this.content[rowIndex].prevCell();
                        this.chaneActiveRow($event, rowIndex);

                        break;
                    case 'Tab':
                    case 'ArrowRight':
                        if(! this.content[rowIndex]) {
                            return;
                        }

                        this.content[rowIndex].nextCell();
                        this.chaneActiveRow($event, rowIndex);

                        break;
                    case 'Enter':

                        break;
                }

                if(! ['input', 'select', 'textarea'].includes(document.activeElement.nodeName.toLowerCase())) {
                    $event.stopPropagation();
                    $event.preventDefault();
                }

            },

            handelOrder(order) {
                this.$emit('order', order);
            },

            updateList() {
                this.remainRows = Math.floor(this.$refs.contentEl.clientHeight / this.rowSize);
                this.rowsBench = this.remainRows * 12;
                this.randomId = uuid();

                this.$nextTick(() => {
                    if(this.heightComponent) {
                        if(this.heightComponent.ready) {
                            this.heightComponent.updateVisibleItems(false);
                        }

                        this.$nextTick(() => {
                            this.heightComponent.scrollToPosition(this.scrollPos.top || 0);
                        });
                    }

                    if(this.widthElement) {
                        this.$nextTick(() => {
                            this.widthElement.scrollLeft = this.scrollPos.left || 0;
                        });
                    }

                    if(this.$refs.scrollbar) {
                        this.$refs.scrollbar.update();
                    }
                });
            },

            resetCellsStyles() {
                this.cellsStyle = {};
            },

            scrollCellIntoView(cell) {
                if (!cell) {
                    return;
                }

                let yTarget = getTargetScrollLocationY(cell, this.heightElement);
                let xTarget = getTargetScrollLocationX(cell, this.widthElement);

                if(yTarget.isOut) {
                    this.heightComponent.scrollToPosition(yTarget.y);
                }

                if(xTarget.isOut) {
                    this.widthElement.scrollLeft = xTarget.x;
                }

                if(this.$refs.scrollbar && (yTarget.isOut || xTarget.isOut)) {
                    this.$refs.scrollbar.update();
                }
            },

            updateCellWidth(cellIndex, width) {
                if(! this.cellsStyle[cellIndex]) {
                    this.$set(this.cellsStyle, cellIndex, {});
                }

                this.$set(this.cellsStyle[cellIndex], 'width', width);

                this.$nextTick(() => {
                    if(this.$refs.scrollbar) {
                        this.$refs.scrollbar.update();
                    }
                });
            },

            loadMore() {
                this.$emit('load-next');
            },

            updateWidth(width) {
                this.contentStyle.width = (scrollbarWidth() + width) + 'px';

                this.$nextTick(() => {
                    if(this.$refs.scrollbar) {
                        this.$refs.scrollbar.update();
                    }
                });
            }
        },

        computed: {
            heightComponent() {
                return this.$refs.heightElement;
            },

            widthComponent() {
                return this.$refs.widthElement;
            },

            heightElement() {
                return this.heightComponent && this.heightComponent.$el ?
                    this.heightComponent.$el : this.heightComponent;
            },

            widthElement() {
                return this.widthComponent && this.widthComponent.$el ?
                    this.widthComponent.$el : this.widthComponent;
            }
        },

        components: {
            RecycleScroller,
            DataTableHeader,
            DataTableRow,
            VirtualList,
            Scrollbar
        },

        beforeDestroy() {
            for(let row of this.content) {
                row.deactivate();
            }

            off(document, 'keydown', this.onKeypress);
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
            display: flex;
            flex-direction: column;
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