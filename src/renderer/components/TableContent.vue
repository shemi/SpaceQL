<template>

    <div class="snr-table-content-container">

        <el-form :inline="true"
                 :model="query"
                 size="mini"
                 @submit.native="queryContent"
                 class="form-inline-search-section"
                 ref="queryForm">

            <el-form-item label="WHERE" prop="column">
                <el-select v-model="query.column"
                           placeholder="Select column"
                           filterable
                           default-first-option>
                    <el-option v-for="item in columns"
                               :key="item.name"

                               :label="item.name"
                               :value="item.name">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item class="query-operator-form-item" prop="operator">
                <el-select v-model="query.operator"
                           placeholder="Select operator"
                           filterable
                           default-first-option>
                    <el-option v-for="item in operators"
                               :key="item"
                               :label="item"
                               :value="item">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item class="query-search-form-item" prop="value">
                <el-input
                        placeholder="Type value"
                        v-model="query.value">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button native-type="submit">Query</el-button>
            </el-form-item>

        </el-form>

        <div class="data-table-section">
            <data-table :columns="columns" sortable editable
                        :loading="loading"
                        :scroll-pos="scrollPos"
                        ref="datatable"
                        :order="order"
                        @scroll="handleScroll"
                        @order="handelOrder"
                        :content="content">
            </data-table>
        </div>

        <main-footer>
            <div class="footer-action is-icon" @click="fetchContent(true)">
                <i class="el-icon-refresh"></i>
            </div>
        </main-footer>
    </div>

</template>

<script>
    import DataTable from './DataTable/DataTable';
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';
    import {QUERY_OPRATORS} from "../../utils/constants";
    import debounce from 'lodash/debounce';
    import MainFooter from "./MainFooter";

    export default {

        mixins: [GeneralComputedMixin],

        data() {
            return {
                loading: false,
                loaded: false,
                operators: QUERY_OPRATORS
            }
        },

        watch: {
            database: {
                handler(database) {
                    if(database && ! this.table) {
                        database.selectFirstTable();
                    }
                },
                immediate: true
            },
            table: {
                handler(table) {
                    this.loaded = false;
                    this.fetchContent();
                },
                deep: false,
                immediate: true
            }
        },

        methods: {
            queryContent(e) {
                e.preventDefault();

                this.fetchContent(true);
            },

            handleScroll: debounce(function(pos) {
                this.table.setState('scrollTop', pos.top);
                this.table.setState('scrollLeft', pos.left);
            }, 80),

            handelOrder(order) {
                this.order = order;

                this.fetchContent(true);
            },

            fetchContent(refresh = false) {
                if(! this.table) {
                    return;
                }

                this.loaded = true;

                if(! refresh) {
                    this.loading = true;
                }

                return this.table.getContent(refresh)
                    .then(table => {
                        this.loading = false;

                        if(refresh && this.$refs.datatable) {
                            this.$refs.datatable.updateList();
                        }

                        return table;
                    })
                    .catch(err => {
                        console.log('table', err);
                    })
            }
        },

        computed: {

            scrollPos() {
                if(! this.table) {
                    return {
                        top: 0,
                        left: 0
                    }
                }

                return {
                    top: this.table.getState('scrollTop'),
                    left: this.table.getState('scrollLeft')
                }
            },

            query: {
                get() {
                    return this.table ? this.table.getState('queryForm') : {};
                },
                set(value) {
                    this.table.setState('queryForm', value);
                }
            },

            order: {
                get() {
                    return this.table ? this.table.getState('order') : {};
                },
                set(value) {
                    this.table.setState('order', value);
                }
            },

            limit: {
                get() {
                    return this.table ? this.table.getState('limit') : {};
                },
                set(value) {
                    this.table.setState('limit', value);
                }
            },

            columns() {
                return this.table ? this.table.tableColumns.all() : [];
            },

            content() {
                return this.table ? this.table.content.all() : [];
            }

        },

        components: {
            DataTable,
            MainFooter
        }

    }

</script>

<style lang="scss" scoped>
    @import "../scss/variables";

    .snr-table-content-container {
        display: flex;
        height: 100%;
        flex-direction: column;

        .data-table-section {
            display: flex;
            height: 100%;
            flex-direction: column;
        }
    }

    .form-inline-search-section {
        flex-grow: 0;
        flex-shrink: 0;
        padding: 5px;
        background-color: $--color-white;

        .el-form-item {
            margin-bottom: 0;
        }

    }

    .query-operator-form-item {
        width: 85px;
    }

</style>