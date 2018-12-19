<template>

    <div :style="style" :class="classes" class="data-table-cell">
        <div class="cell-content">
            <el-tag v-if="cell.displayTag" size="mini" type="info">
                {{ cell.displayTag }}
            </el-tag>
            <span v-else>
                {{ cell.displayValue }}
            </span>
        </div>
    </div>

</template>

<script>

    export default {

        props: {
            cell: {
                type: Object,
                default: () => {return {}}
            },
            editable: {
                type: Boolean,
                default: false
            },
            rowIndex: Number,
            cellIndex: Number,
            cellStyle: Object
        },

        data() {
            return {

            }
        },

        watch: {

        },

        computed: {

            classes() {
                return {

                }
            },

            style() {
                if(! this.cellStyle && ! this.cellStyle[this.cellIndex]) {
                    return {};
                }

                return {
                    ...this.cellStyle[this.cellIndex]
                }
            }
        }

    }

</script>

<style lang="scss" scoped>

    .data-table-cell {
        display: flex;
        width: 100%;
        height: 100%;

        .cell-content {
            line-height: 1;
        }

        .el-tag--mini {
            height: 12px;
            padding: 0 4px;
            border-radius: 0;
            line-height: 12px;
            font-size: 0.7em;
        }

    }

</style>