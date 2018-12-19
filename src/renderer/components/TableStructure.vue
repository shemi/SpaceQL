<template>

    <div class="spql-table-structure-container">

        <div class="spql-table-structure-form" v-if="this.table">

            <el-form ref="form"
                     :model="form"
                     size="mini"
                     label-position="top"
                     label-width="120px">

                <el-row :gutter="5">
                    <el-col :span="15">
                        <el-form-item label="Name">
                            <el-input v-model="form.name">
                                <template slot="prepend">{{ form.database }}.</template>
                            </el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="9">
                        <el-form-item label="Engine">
                            <el-select v-model="form.engine"
                                       filterable
                                       placeholder="Select Storage Engine">
                                <el-option
                                        :title.prop="item.comment"
                                        v-for="item in database.storageEngines"
                                        :key="item.name"
                                        :label="item.name"
                                        :value="item.name"
                                        :disabled="item.is_disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="5">
                    <el-col :span="12">
                        <el-form-item label="Character Set">
                            <el-select v-model="selectedCharacterSet"
                                       filterable
                                       default-first-option
                                       @change="characterSetsChanged"
                                       placeholder="Select Character Set">
                                <el-option
                                        v-for="item in connection.characterSets"
                                        :key="item.name"
                                        :label="item.name"
                                        :value="item.name">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="Collation">
                            <el-select v-model="form.collation"
                                       filterable
                                       default-first-option
                                       placeholder="Select Collation">
                                <el-option
                                        v-for="item in filteredCollations"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.name">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="5" justify="end">
                    <el-col :span="24" class="submit-row">
                        <el-button size="mini"
                                   @click="resetTableStructure"
                                   v-if="table.changed">Revert</el-button>

                        <el-button type="primary"
                                   size="mini"
                                   :disabled="! table.changed"
                                   native-type="submit">Save</el-button>
                    </el-col>
                </el-row>

            </el-form>

        </div>

        <el-tabs v-if="this.table"
                 v-model="activeTab"
                 class="spql-table-structure-tabs"
                 tab-position="top"
                 @tab-click="handleTabChanged">
            <el-tab-pane label="Columns" name="columns">
                COLUMNS
            </el-tab-pane>

            <el-tab-pane label="Indexes" name="indexes">
                Indexes
            </el-tab-pane>

            <el-tab-pane label="Options" name="options">
                OPTIONS
            </el-tab-pane>
        </el-tabs>

        <main-footer></main-footer>
    </div>

</template>

<script>
    import MainFooter from "./MainFooter";
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';
    import find from 'lodash/find';

    export default {

        mixins: [GeneralComputedMixin],

        data() {
            return {
                selectedCharacterSet: ''
            }
        },

        watch: {
            table: {
                immediate: true,
                handler() {
                    this.setCharacterSetByCollation();
                }
            }
        },

        mounted() {

        },

        methods: {
            resetTableStructure() {
                if(! this.table.structure) {
                    return;
                }

                this.table.structure.reset();
                this.setCharacterSetByCollation();
            },

            handleTabChanged() {

            },

            setCharacterSetByCollation() {
                if(! this.connection) {
                    return;
                }

                let collation = find(this.connection.collations, {name: this.form.collation});

                if(collation) {
                    this.selectedCharacterSet = collation.character_set;
                }
            },

            characterSetsChanged() {
                let set = find(this.connection.characterSets, {name: this.selectedCharacterSet});

                if(! set || ! set.default_collate) {
                    return;
                }

                this.$set(this.form, 'collation', set.default_collate);
            }
        },

        computed: {
            storageEngines() {
                return this.database ? this.database.storageEngines : [];
            },

            form() {
                return this.table ? this.table.structure.form : {};
            },

            filteredCollations() {
                if(! this.connection) {
                    return [];
                }

                return this.connection.collations.filter((item) => {
                    return item.character_set === this.selectedCharacterSet;
                })
            },

            activeTab: {
                get() {
                    return this.table.getState('structureTab');
                },
                set(val) {
                    this.table.setState('structureTab', val);
                }
            }
        },

        components: {
            MainFooter
        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .spql-table-structure-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        align-items: flex-start;
        justify-content: flex-start;
        background-color: white;
    }

    .spql-table-structure-form {
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
        border-bottom: 1px solid $--color-border-main-header;

        .submit-row {
            display: flex;
            justify-content: flex-end;
        }

        .el-select {
            width: 100%;
            box-sizing: border-box;
        }

        .el-form-item--mini.el-form-item {
            margin-bottom: 0;
        }

        .el-row + .el-row {
            margin-top: 5px;
        }

        .el-form {
            width: 100%;

            .el-form-item--mini {
                .el-form-item__label {
                    line-height: 1;
                }
            }

            .el-form--label-top .el-form-item__label {
                padding: 0 0 5px 0;
            }
        }
    }

    .spql-table-structure-tabs {
        flex-grow: 1;
        flex-shrink: 1;
        width: 100%;
        display: flex;
        flex-direction: column;

        .el-tabs__nav-wrap.is-top {
            padding: 0 5px;
        }

        &.el-tabs.el-tabs--top {
            .el-tabs__header {
                margin: 0;
                flex-grow: 0;
                flex-shrink: 0;
            }

            .el-tabs__nav {
                border-bottom: 0;
                border-left: 0;
            }

            .el-tabs__content {
                padding: 5px;
                height: 100%;
                flex-grow: 1;
                flex-shrink: 0;
            }

            .el-tabs__item {
                height: 30px;
                line-height: 30px;
                border-radius: 0;
                border-top: none;

                &:first-child {
                    border-left: none;
                }
            }
        }

    }

</style>