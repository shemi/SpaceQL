<template>

    <div :data-cell-key="'cell_'+index+'_'+column.name"
         :style="cellStyle"
         class="data-table-cell data-table-header-cell">

        <div class="cell-content">{{ column.name }}</div>

        <span class="caret-wrapper" v-if="isSortable">
            <span class="caret-holder">
                <i class="sort-caret ascending"></i>
                <i class="sort-caret descending"></i>
            </span>
        </span>

        <div class="resize-handler" @mousedown.prevent="startResize"></div>
    </div>

</template>

<script>

    export default {

        props: {
            column: Object,
            index: Number,
            isSortable: Boolean
        },

        inject: ['rootTable'],

        data() {
            return {
                handler: null,
                width: 'auto',
                resizeFunction: null,
                stopResizeFunction: null,
            }
        },

        mounted() {
            this.init();
        },

        beforeDestroy() {
            if(this.stopResizeFunction) {
                window.removeEventListener('mouseup', this.stopResizeFunction);
            }
        },

        watch: {
            column() {
                this.init();
            },

            index() {
                this.init();
            }
        },

        methods: {

            init() {
                this.handler = this.$el.querySelector('.resize-handler');
                this.width = 'auto';

                this.$nextTick(() => {
                    this.updateCellWidth(this.$el.getBoundingClientRect().width+'px');
                });
            },

            startResize(e) {
                if(! this.resizeFunction) {
                    this.resizeFunction = this.resize.bind(this);
                }

                if(! this.stopResizeFunction) {
                    this.stopResizeFunction = this.stopResize.bind(this);
                }

                window.addEventListener('mousemove', this.resizeFunction);
                window.addEventListener('mouseup', this.stopResizeFunction);
            },

            resize(e) {
                this.updateCellWidth(e.pageX - this.$el.getBoundingClientRect().left + 'px');
            },

            stopResize() {
                window.removeEventListener('mousemove', this.resizeFunction);
            },

            updateCellWidth(width) {
                this.width = width;
                this.rootTable.updateCellWidth(this.index, width);
            }

        },

        computed: {
            cellStyle() {
                return {
                    width: this.width
                }
            }
        }

    }

</script>