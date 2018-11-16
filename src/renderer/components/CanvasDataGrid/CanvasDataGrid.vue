<template>

    <div class="spql-canvas-data-grid">
        <canvas-datagrid ref="grid" v-bind.prop="gridOptions"></canvas-datagrid>
    </div>

</template>

<script>
    import Vue from 'vue';
    import 'canvas-datagrid';
    import style from './style';

    Vue.config.ignoredElements = [
        'canvas-datagrid'
    ];

    export default {
        name: 'spql-canvas-data-grid',

        props: {
            content: Array,
        },

        watch: {
            content: {
                immediate: true,
                deep: true,
                handler(val, oldVal) {
                    if(! val) {
                        return;
                    }

                    this.setData(val);
                }
            }
        },

        data() {
            return {
                gridOptions: {
                    style,
                    ellipsisText: '',
                    saveAppearance: false,
                    data: this.content || []
                },
                _grid: null
            }
        },

        mounted() {
            this.grid.style.width = "100%";
            this.grid.style.height = "100%";
            this.grid.style.cellWhiteSpace = "normal";
            this.grid.attributes.ellipsisText = "normal";

            this.grid.addEventListener('formattext', (e) => {
                e.preventDefault();

                console.log(e.cell);

                e.cell.text = {lines: [{value: e.cell.value}]};
            });
        },

        methods: {

            setData(rows) {
                let rowIndex;
                this.gridOptions.data = [];

                for(rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    this.gridOptions.data.push(rows[rowIndex].toGrid());
                }
            }

        },

        computed: {
            grid() {
                return this.$refs.grid;
            }
        },

        beforeDestroy() {
            this.grid.dispose();
        }

    }

</script>

<style lang="scss" scoped>

    .spql-canvas-data-grid {
        height: 100%;
        width: 100%;
        overflow: hidden;

        canvas-datagrid {
            display: block;
            width: 100%;
            height: 100%;
        }

    }

</style>