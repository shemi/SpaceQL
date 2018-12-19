<template>

    <div :style="style" :class="classes" class="data-table-cell" tabindex="-1">
        <div class="cell-content">
            <template v-if="! editMode" class="display-text">
                <el-tag v-if="cell.displayTag" size="mini" type="info" class="display-text">
                    {{ cell.displayTag }}
                </el-tag>
                <span class="display-text" v-else>
                    {{ cell.displayValue }}
                </span>
            </template>
            <template v-else>
                <input type="text" ref="input" v-model="newValue" autofocus>
            </template>
        </div>
    </div>

</template>

<script>
    import {} from 'element-ui/src/utils/scroll-into-view';

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

        inject: ['rootTable'],

        data() {
            return {
                newValue: this.cell.originalValue
            }
        },

        watch: {
            isFocused(val) {
                if(val && this.$el) {
                    this.rootTable.scrollCellIntoView(this.$el);
                }
            }
        },

        mounted() {

        },
        
        methods: {
            edit() {
                if(! this.editable) {
                    return;
                }

                this.editMode = true;
                this.focus(false);
                this.$emit('in-edit-mode', this);

                this.$nextTick(() => {
                    this.$refs.input.focus();
                    this.$refs.input.select();
                });
            },
            
            exitEditMode() {
                this.editMode = false;
                this.exitFocus();
            },

            focus(emit = true) {
                this.isFocused = true;
                this.$el.focus();
                
                emit && this.$emit('is-focused', this);
            },

            exitFocus() {
                this.isFocused = false;
            }
        },

        computed: {

            editMode() {
                return this.cell.inEditMode;
            },

            isFocused() {
                return this.cell.isFocused;
            },

            classes() {
                return {
                    'is-focused': this.isFocused,
                    'in-edit-mode': this.editMode
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
    @import "../../scss/variables";

    .data-table-cell {
        padding: 5px 3px;
        box-sizing: border-box;
        min-width: 25px;
        flex-shrink: 0;
        flex-grow: 0;
        display: flex;
        width: 100%;
        height: 100%;
        border: 1px solid transparent;

        .cell-content {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: keep-all;
            line-height: 1;

            .display-text {
                user-select: none;
            }

        }

        &:hover:not(.is-focused) {
            background-color: $--color-primary-light-6;
        }

        &.is-focused {
            border: 1px solid $--color-primary-light-4;
        }

        .el-tag--mini {
            height: 12px;
            padding: 0 4px;
            border-radius: 0;
            line-height: 12px;
            font-size: 0.7em;
        }

        input {
            padding: 0;
            border: 0;
            outline: 0;
            background-color: transparent;
        }

    }

</style>