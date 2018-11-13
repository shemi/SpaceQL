<template>

    <div class="connection-aside-container aside-container"
         v-loading="database.loadingTables">

        <div class="connection-aside-header">
            <p class="title" v-if="! searchActive">
                Tables
            </p>

            <el-input placeholder="Search Table"
                      size="mini"
                      ref="searchField"
                      v-else
                      v-model="search"></el-input>

            <div class="actions">
                <el-button :icon="'el-icon-' + (searchActive ? 'close' : 'search')"
                           @click="toggleSearch"
                           size="mini" circle>
                </el-button>
            </div>
        </div>

        <div class="tables-list-container">
            <el-scrollbar ref="scrollbar"
                          view-class="aside-list"
                          :wrap-style="scrollbarWrapStyles"
                          v-if="tables.length > 0">

                <div v-for="item in filteredTables"
                     :key="item.name" class="aside-list-item">
                    <a @click="selectTable(item)"
                       :class="{'is-active': table && item.name === table.name}"
                       class="aside-item">
                        <span>{{ item.name }}</span>
                    </a>
                </div>

            </el-scrollbar>
        </div>

        <div class="connection-aside-footer">
            <div class="sp-main-footer-controls">
                <div class="footer-action is-icon" @click="refreshTables">
                    <i class="el-icon-refresh"></i>
                </div>

                <div class="footer-action is-icon" @click="showCreateTableModal">
                    <i class="el-icon-plus"></i>
                </div>
            </div>
        </div>

    </div>

</template>

<script>
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';
    import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
    import Fuse from 'fuse.js';

    export default {

        mixins: [GeneralComputedMixin],

        data() {
            return {
                scrollbarWrapStyles: `width: calc(100% + ${scrollbarWidth()}px); height: calc(100% + ${scrollbarWidth()}px);`,
                search: '',
                showSearch: false,
                fuse: new Fuse(this.tables, {
                    keys: [
                        {name: 'name', weight: 1}
                    ]
                })
            }
        },

        methods: {
            toggleSearch() {
                this.search = '';
                this.showSearch = ! this.showSearch;

                this.$nextTick(() => {
                    if(this.showSearch && this.$refs.searchField) {
                        this.$refs.searchField.focus();
                    }
                });
            },

            selectTable(table) {
                if(! this.database) {
                    return;
                }

                this.database.selectTable(table);
            },

            refreshTables() {
                if(! this.database) {
                    return;
                }

                this.database.loadTables(true)
                    .then(res => {})
                    .catch(err => {});
            },

            showCreateTableModal() {
                this.tab.setDynamicModal('SpCreateTableModal');
            }
        },

        computed: {

            searchActive() {
                return this.showSearch || !! this.search;
            },

            filteredTables() {
                let tables = this.tables;

                if(this.search) {
                    this.fuse.setCollection(this.tables);
                    tables = this.fuse.search(this.search);
                }

                return tables;
            },

            tables() {
                return this.database ? this.database.tables.all() : [];
            }

        }

    }

</script>

<style lang="scss" scoped>
    @import "../scss/variables";

    .el-scrollbar {
        overflow: hidden;
        height: 100%;
    }

    .connection-aside-container {
        height: 100%;
        display: flex;
        flex-direction: column;

        .connection-aside-header {
            padding: 10px 5px;
            border-bottom: 1px solid #e4e7ed;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .el-input {
                flex: 1 1;
                margin-right: 5px;
            }

            .el-button + .el-button {
                margin-left: 0px;
            }

            .title {
                margin: 0;
                font-size: 1em;
                font-weight: 400;
            }
        }

        .tables-list-container {
            height: 100%;
            overflow: hidden;
            flex-shrink: 1;
            flex-grow: 1;
        }
    }

    .aside-item {
        color: black;
        text-decoration: none;
        padding: 10px 5px;
        display: block;
        cursor: pointer;

        &:hover {
            color: $--color-primary-light-2;
        }

        &.is-active {
            color: $--color-primary;
        }
    }

    .aside-list {
        .aside-list-item {
            border-bottom: 1px solid $--color-border-main-main-aside;

            .aside-item {
                display: flex;
                align-items: center;
                line-height: 0.9;
                font-size: 0.9em;
                padding: 8px 5px;
            }

            .svg-icon {
                margin-right: 6px;
            }

        }
    }

    .connection-aside-footer {
        display: flex;
        font-size: 0.95em;
        padding: 0 20px 0 0;
        background-color: $--color-background-main-aside;
        border-top: 1px solid $--color-border-main-header;
        flex-grow: 0;
        flex-shrink: 0;
        height: 32px;

        .sp-main-footer-controls {
            display: flex;
            width: 40%;
        }

        .footer-action {
            flex-shrink: 0;
            flex-grow: 0;
            padding: 5px;
            border-left: 1px solid $--color-border-main-header;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-content: center;
            justify-content: center;
            color: $--color-text-primary;

            a {
                color: $--color-text-primary;
                text-decoration: none;
                cursor: pointer;
                display: flex;
                align-content: center;
                justify-content: center;

                i,
                span {
                    line-height: 1;
                    display: inline-flex;
                    align-items: center;
                }

            }

            &:hover {
                background-color: $--color-primary-light-6;
            }

            &:last-child {
                border-right: 1px solid $--color-border-main-header;
            }

            &.is-icon {
                font-size: 1.2em;

                i {
                    line-height: 1;
                    display: inline-flex;
                    height: 1em;
                    flex-grow: 0;
                    align-self: center;
                    flex-shrink: 0;
                    color: $--color-text-regular;
                }

                &:hover i{
                    color: $--color-black;
                }
            }
        }

    }

</style>