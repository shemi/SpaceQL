<template>

    <div class="snr-query-container">

        <div class="snt-query-header">
            <el-button-group class="snt-query-header-actions">
                <el-button icon="far fa-play-circle" size="small" @click="exec"></el-button>
                <el-button icon="fas fa-file-upload" size="small"></el-button>
                <el-button icon="fas fa-file-download" size="small"></el-button>
            </el-button-group>
        </div>

        <div class="snr-query-wrap">
            <div ref="topWindow" class="query-editor">
                <code-mirror v-model="queryString"
                             :options="editorOptions">
                </code-mirror>
            </div>

            <div ref="bottomWindow" class="query-results-table" v-loading="loading">
                <el-tabs v-model="query.selectedTab" type="card" v-if="! loading">

                    <el-tab-pane v-for="set in query.resultsSets"
                                 :label="'Results #' + set.index"
                                 lazy
                                 :key="'' + set.index"
                                 :name="'' + set.index">

                        <data-table :columns="set.columns"
                                    :chunks-id="set.chunksId"
                                    :total="set.total"
                                    ref="dataTables"
                                    @load-next="handelLoadMore(set)"
                                    :content="set.rows">
                        </data-table>

                    </el-tab-pane>

                </el-tabs>
            </div>
        </div>

        <main-footer></main-footer>
    </div>

</template>

<script>
    import Split from 'split.js';
    import DataTable from './DataTable/DataTable';
    import MainFooter from "./MainFooter";
    import CodeMirror from "./CodeMirror/CodeMirror";

    export default {

        data() {
            return {
                activeTab: '1',
                loading: false,
                queryString: '',
            }
        },

        mounted() {
            this.initPageSplit();

            if(this.query) {
                this.queryString = this.query.lastSql;

                if(this.$refs.dataTables && this.$refs.dataTables[this.query.selectedTab]) {
                    this.$nextTick(() => {
                        this.$refs.dataTables[this.query.selectedTab].updateList();
                    });
                }
            }
        },

        methods: {
            initPageSplit() {
                Split([this.$refs.topWindow, this.$refs.bottomWindow], {
                    direction: 'vertical',
                    sizes: [40, 60],
                    minSize: [50, 50],
                    onDrag: this.onDrag.bind(this),
                    elementStyle(dimension, size, gutterSize) {
                        return {
                            'height': 'calc(' + size + '% - ' + gutterSize + 'px)'
                        }
                    },
                    gutterStyle(dimension, gutterSize) {
                        return {
                            'flex-basis':  gutterSize + 'px'
                        }
                    }
                });
            },

            onDrag() {
                if(! this.$refs.editor) {
                    return;
                }

                this.$refs.editor.refresh();
            },

            exec() {
                if(! this.database) {
                    return;
                }

                this.loading = true;

                this.query.exec(this.queryString)
                    .then(() => {
                        this.query.selectedTab = 0;
                        this.loading = false;
                    })
                    .catch(err => {
                        console.error(err);
                        this.loading = false;
                    });
            },

            handelLoadMore(set) {
                set.next();
            }
        },

        computed: {
            tab() {
                return this.$store.getters['Tabs/getTabById'](
                    parseInt(this.$route.params.tabId)
                );
            },

            tabId() {
                return this.tab ? this.tab.id : '';
            },

            connection() {
                return this.tab ? this.tab.connection : null;
            },

            database() {
                return this.connection ? this.connection.selectedDatabase : null;
            },

            query() {
                return this.database ? this.database.query : null;
            },

            editorOptions() {
                return {
                    connect: 'align',
                    mode: 'text/x-mysql',
                    lineNumbers: true,
                    matchBrackets: true,
                    collapseIdentical: false,
                    highlightDifferences: true,
                    extraKeys: {
                        'Ctrl-Space': 'autocomplete'
                    },
                    hintOptions: {
                        completeSingle: false,
                        completeOnSingleClick: true,
                        defaultTable: this.database && this.database.selectedTable ? this.database.selectedTable.name : '',
                        tables: this.database ? this.database.toAutocomplete : []
                    },
                    indentUnit: 4,
                    lineWrapping: true
                }
            }
        },

        components: {
            MainFooter,
            DataTable,
            CodeMirror
        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .snr-query-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        height: 100%;
        box-sizing: border-box;

        .snr-query-wrap {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            flex-shrink: 1;
            height: calc(100% - 30px);
            box-sizing: border-box;

            > div:not(.gutter-vertical) {
                box-sizing: border-box;
                flex-grow: 1;
                flex-shrink: 1;
            }
        }

        .gutter {
            background-color: #3a3a3a;
            background-repeat: no-repeat;
            background-position: 50%;
        }

        .gutter.gutter-horizontal {
            background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
            cursor: ew-resize;
        }

        .gutter.gutter-vertical {
            background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
            cursor: ns-resize;
        }

        .el-tabs {
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: white;

            .el-tabs__header {
                flex-grow: 0;
                margin: 0 0 -1px 0;
            }

            .el-tabs__content {
                flex-grow: 1;
                height: 100%;
            }

            .el-tab-pane {
                height: 100%;
            }

            .el-tabs__item {
                height: 30px;
                line-height: 30px;
                border-radius: 0;
            }

        }

        .snt-query-header {
            background-color: $--color-background-main-header;
            padding: 5px;
            border-bottom: 1px solid $--color-border-main-header;
            flex-grow: 0;
            flex-shrink: 0;
        }

    }

</style>
