<template>

    <div class="sp-log-container" :class="{'is-empty': emptyLog || filteredRows.length <= 0}">

        <div class="sp-log-header">
            <el-button class="action"
                       icon="el-icon-remove"
                       @click="clearLogs"
                       size="mini">
            </el-button>

            <div class="form">
                <div class="form-item search">
                    <el-input placeholder="Search"
                              prefix-icon="el-icon-search"
                              size="mini"
                              clearable
                              autofocus
                              v-model="search">
                    </el-input>
                </div>

                <div class="from-item levels-select">
                    <el-select v-model="levels"
                               multiple collapse-tags
                               size="mini"
                               placeholder="Select">
                        <el-option v-for="item in levelsOption"
                                   :key="item"
                                   :label="item"
                                   :value="item">
                        </el-option>
                    </el-select>
                </div>
            </div>

            <div class="count-message" v-if="hiddenCount >= 1">
                {{ hiddenCount }} {{ hiddenCount > 1 ? 'items' : 'item' }} hidden by filters
            </div>

            <el-button class="action is-end"
                       :type="showSettings ? 'primary' : 'default'"
                       icon="el-icon-more"
                       @click="toggleSettings"
                       size="mini">
            </el-button>
        </div>

        <div class="sp-log-settings" v-if="showSettings">
            <div class="options">
                <div class="option">
                    <el-checkbox v-model="filterDatabase">Show items related the selected database</el-checkbox>
                </div>
            </div>
        </div>

        <div class="empty-message" v-if="emptyLog">
            <div class="log-message-icon">
                <svg version="1.1" id="Layer_1" x="0px" y="0px"	 viewBox="0 0 90 90" enable-background="new 0 0 90 90" xml:space="preserve"><path fill="#231F20" d="M39.7,39.4C39.7,39.4,39.7,39.4,39.7,39.4C39.7,39.4,39.7,39.4,39.7,39.4c6,0,10.9-4.9,10.9-11	c0-2.9-0.9-4.2-1.3-4.7c-1.7-2.7-8-2.9-9.3-2.9c-0.2,0-0.3,0-0.3,0c-6.1,0-8.6,1.9-9.3,2.6c0,0,0,0-0.1,0.1	c-0.1,0.1-0.2,0.2-0.2,0.2c-0.4,0.5-1.3,1.9-1.3,4.7C28.8,34.5,33.7,39.4,39.7,39.4z M31.1,24.5L31.1,24.5L31.1,24.5	c0,0,0.1-0.1,0.1-0.1l0,0c0.6-0.5,2.8-2.3,8.5-2.3l0,0l0,0c0,0,0.1,0,0.2,0c3.4,0,7.3,0.7,8.3,2.3l0,0.1l0,0.1c0.4,0.5,1,1.6,1,3.9	c0,5.4-4.3,9.8-9.6,9.8l0,0h0l0,0l0,0c-5.3,0-9.6-4.4-9.6-9.8C30.1,26.1,30.7,24.9,31.1,24.5z M42.3,49.9h-4.8V49h4.8V49.9z	 M51.2,61.1l-0.3,0l0,0L51.2,61.1l0-2.3c2.9-0.2,5.2-2.6,5.4-5.5l0-6.1c0-4.3-2.3-8.2-5.8-10.8c1.6-2.1,2.5-4.8,2.5-7.6	c0-7.3-6.1-13.2-13.5-13.2s-13.5,5.9-13.5,13.2c0,2.8,0.9,5.4,2.5,7.6c-3.6,2.6-5.9,6.5-5.9,10.8v6.1h0c0.1,1.6,0.8,3,2,4	c-0.3,0.1-0.6,0.2-0.9,0.4L23.3,58l0,0l-2.5,1.2l0,0l0,0l0.5,1.2l0.1,0l3.6,7h-9.1v1.3h9.8l0.5,1l2-1h0.7v10.1h0v2.7h11.8v-2.7v-0.6	h0v-9.5h0.6v0h25.4v-1.3H47.7C49.8,66.1,51.2,63.8,51.2,61.1z M27.5,28.7c0-6.6,5.5-11.9,12.3-11.9S52,22.2,52,28.7	s-5.5,11.9-12.3,11.9S27.5,35.3,27.5,28.7z M24,53v-5.9c0-3.9,2.1-7.5,5.4-9.9c2.5,2.8,6.2,4.6,10.3,4.6c4.1,0,7.8-1.8,10.3-4.6	c3.3,2.4,5.4,5.9,5.4,9.9V53c-0.1,2.5-2.1,4.5-4.6,4.5v0H50v1.5l-4.3-6.7H50h1.3h0v-1.3h0v-3.3H50v3.3h-4.6v-4.7H34.8v4.7h-4.6v-3.3	h-1.3v3.3v1.3h1.3h6.5l-10.3,4.5C25,56.1,24.1,54.7,24,53z M44.1,47.7v2.2l-0.4-0.6L39.8,51h-2.2v0.1H36v-3.4H44.1z M26.6,67.9l-4-8	l1.4-0.6l4,8L26.6,67.9z M29.2,66.8l-0.1,0.1l-4-8l1.3-0.6c1.8-0.1,3.6,0.8,4.5,2.5C31.9,62.9,31.2,65.4,29.2,66.8z M34.8,72	c-1.9,0-3.6,0.9-4.7,2.4v-6.6l8.6-3.7l0.7,1.5v8.7C38.3,72.9,36.6,72,34.8,72z M39.4,77.3v0.2h-9.3c0.3-2.4,2.3-4.3,4.6-4.3	C37.1,73.2,39,75,39.4,77.3z M39.4,80.3h-9.4v-1.5h9.4V80.3z M41.3,67.4L41.3,67.4l-0.6,0v-2.1l-1.4-2.9l-7.5,3.2	c0.9-1.7,1-3.7,0.1-5.4c-0.7-1.4-2-2.4-3.4-2.9l14.7-6.4L50,61.5c-0.2,3.2-2.8,5.7-6.1,5.9H41.3z M64.4,8.5c-5.4,0-9.8,4.4-9.8,9.8	c0,5.4,4.4,9.8,9.8,9.8c5.4,0,9.8-4.4,9.8-9.8C74.2,12.9,69.8,8.5,64.4,8.5z M64.4,26.8c-4.7,0-8.5-3.8-8.5-8.5	c0-4.7,3.8-8.5,8.5-8.5c4.7,0,8.5,3.8,8.5,8.5C72.9,23,69.1,26.8,64.4,26.8z M68.8,18.7c0,0.4-0.3,0.7-0.7,0.7h-3.9	c-0.3,0-0.6-0.2-0.7-0.4c-0.1-0.1-0.1-0.2-0.1-0.3v-5.8c0-0.3,0.3-0.6,0.6-0.6c0.3,0,0.6,0.3,0.6,0.6v5.1h3.6	C68.5,17.9,68.8,18.2,68.8,18.7z"/></svg>
            </div>
            <h2 class="log-message">The Log Is Empty.</h2>
        </div>

        <div class="empty-message" v-if="! emptyLog && filteredRows.length <= 0">
            <div class="log-message-icon">
                <svg version="1.1" id="Layer_1" x="0px" y="0px"	 viewBox="0 0 90 90" enable-background="new 0 0 90 90" xml:space="preserve"><path fill="#231F20" d="M39.7,39.4C39.7,39.4,39.7,39.4,39.7,39.4C39.7,39.4,39.7,39.4,39.7,39.4c6,0,10.9-4.9,10.9-11	c0-2.9-0.9-4.2-1.3-4.7c-1.7-2.7-8-2.9-9.3-2.9c-0.2,0-0.3,0-0.3,0c-6.1,0-8.6,1.9-9.3,2.6c0,0,0,0-0.1,0.1	c-0.1,0.1-0.2,0.2-0.2,0.2c-0.4,0.5-1.3,1.9-1.3,4.7C28.8,34.5,33.7,39.4,39.7,39.4z M31.1,24.5L31.1,24.5L31.1,24.5	c0,0,0.1-0.1,0.1-0.1l0,0c0.6-0.5,2.8-2.3,8.5-2.3l0,0l0,0c0,0,0.1,0,0.2,0c3.4,0,7.3,0.7,8.3,2.3l0,0.1l0,0.1c0.4,0.5,1,1.6,1,3.9	c0,5.4-4.3,9.8-9.6,9.8l0,0h0l0,0l0,0c-5.3,0-9.6-4.4-9.6-9.8C30.1,26.1,30.7,24.9,31.1,24.5z M42.3,49.9h-4.8V49h4.8V49.9z	 M51.2,61.1l-0.3,0l0,0L51.2,61.1l0-2.3c2.9-0.2,5.2-2.6,5.4-5.5l0-6.1c0-4.3-2.3-8.2-5.8-10.8c1.6-2.1,2.5-4.8,2.5-7.6	c0-7.3-6.1-13.2-13.5-13.2s-13.5,5.9-13.5,13.2c0,2.8,0.9,5.4,2.5,7.6c-3.6,2.6-5.9,6.5-5.9,10.8v6.1h0c0.1,1.6,0.8,3,2,4	c-0.3,0.1-0.6,0.2-0.9,0.4L23.3,58l0,0l-2.5,1.2l0,0l0,0l0.5,1.2l0.1,0l3.6,7h-9.1v1.3h9.8l0.5,1l2-1h0.7v10.1h0v2.7h11.8v-2.7v-0.6	h0v-9.5h0.6v0h25.4v-1.3H47.7C49.8,66.1,51.2,63.8,51.2,61.1z M27.5,28.7c0-6.6,5.5-11.9,12.3-11.9S52,22.2,52,28.7	s-5.5,11.9-12.3,11.9S27.5,35.3,27.5,28.7z M24,53v-5.9c0-3.9,2.1-7.5,5.4-9.9c2.5,2.8,6.2,4.6,10.3,4.6c4.1,0,7.8-1.8,10.3-4.6	c3.3,2.4,5.4,5.9,5.4,9.9V53c-0.1,2.5-2.1,4.5-4.6,4.5v0H50v1.5l-4.3-6.7H50h1.3h0v-1.3h0v-3.3H50v3.3h-4.6v-4.7H34.8v4.7h-4.6v-3.3	h-1.3v3.3v1.3h1.3h6.5l-10.3,4.5C25,56.1,24.1,54.7,24,53z M44.1,47.7v2.2l-0.4-0.6L39.8,51h-2.2v0.1H36v-3.4H44.1z M26.6,67.9l-4-8	l1.4-0.6l4,8L26.6,67.9z M29.2,66.8l-0.1,0.1l-4-8l1.3-0.6c1.8-0.1,3.6,0.8,4.5,2.5C31.9,62.9,31.2,65.4,29.2,66.8z M34.8,72	c-1.9,0-3.6,0.9-4.7,2.4v-6.6l8.6-3.7l0.7,1.5v8.7C38.3,72.9,36.6,72,34.8,72z M39.4,77.3v0.2h-9.3c0.3-2.4,2.3-4.3,4.6-4.3	C37.1,73.2,39,75,39.4,77.3z M39.4,80.3h-9.4v-1.5h9.4V80.3z M41.3,67.4L41.3,67.4l-0.6,0v-2.1l-1.4-2.9l-7.5,3.2	c0.9-1.7,1-3.7,0.1-5.4c-0.7-1.4-2-2.4-3.4-2.9l14.7-6.4L50,61.5c-0.2,3.2-2.8,5.7-6.1,5.9H41.3z M64.4,8.5c-5.4,0-9.8,4.4-9.8,9.8	c0,5.4,4.4,9.8,9.8,9.8c5.4,0,9.8-4.4,9.8-9.8C74.2,12.9,69.8,8.5,64.4,8.5z M64.4,26.8c-4.7,0-8.5-3.8-8.5-8.5	c0-4.7,3.8-8.5,8.5-8.5c4.7,0,8.5,3.8,8.5,8.5C72.9,23,69.1,26.8,64.4,26.8z M68.8,18.7c0,0.4-0.3,0.7-0.7,0.7h-3.9	c-0.3,0-0.6-0.2-0.7-0.4c-0.1-0.1-0.1-0.2-0.1-0.3v-5.8c0-0.3,0.3-0.6,0.6-0.6c0.3,0,0.6,0.3,0.6,0.6v5.1h3.6	C68.5,17.9,68.8,18.2,68.8,18.7z"/></svg>
            </div>
            <h2 class="log-message">Try something else :)</h2>
        </div>

        <el-scrollbar ref="scrollbar" :wrap-style="scrollbarWrapStyles" v-if="filteredRows.length > 0">
            <div class="log-list">

                <div class="log-list-item"
                     v-for="item in filteredRows"
                     :class="['log-list-item-' + item.type]"
                     :key="item.id">

                    <div class="icon">
                        <i :class="['el-icon-' + item.type]"></i>
                    </div>

                    <div class="lines">
                        <div class="head-line">
                            <div class="date" :title="item.createdAt.toLocaleString()">
                                {{ item.displayCreatedAt() }}
                            </div>

                            <div class="location">
                                {{ item.displayLocation() }}
                            </div>
                        </div>

                        <div class="line message-line" @click="toggleItem(item)">
                            <div class="text">
                                <i :class="['toggle-icon', 'el-icon-caret-' + (item.isOpen ? 'bottom' : 'right')]"></i>
                                {{ item.message }}
                            </div>
                        </div>

                        <pre class="line sql-line"
                             v-if="item.sqlString && item.isOpen"
                             v-code="item.sqlString">
                            <code class="sql"></code>
                        </pre>

                        <div class="meta-line" v-if="item.isOpen">
                            <div class="item">
                                <span class="label">Time:</span>
                                <span class="message">
                                    {{ item.displayStartTime || 'N/A' }}
                                    <i class="el-icon-caret-right"></i>
                                    {{ item.displayEndTime || 'N/A' }}
                                </span>
                            </div>

                            <div class="item" v-if="item.code">
                                <span class="label">Code:</span>
                                <span class="message">{{ item.code }}</span>
                            </div>

                            <div class="item" v-if="item.errno">
                                <span class="label">Error NO:</span>
                                <span class="message">{{ item.errno }}</span>
                            </div>

                            <div class="item" v-if="item.sqlState">
                                <span class="label">SQL State:</span>
                                <span class="message">{{ item.sqlState }}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </el-scrollbar>
    </div>

</template>

<script>
    import LogComputedMixin from '../mixins/LogComputedMixin';
    import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
    import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../../utils/constants";
    import Fuse from 'fuse.js';

    export default {
        mixins: [LogComputedMixin],

        data() {
            return {
                scrollbarWrapStyles: `width: calc(100% + ${scrollbarWidth()}px); height: calc(100% + ${scrollbarWidth()}px);`,
                levelsOption: [LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING],
                fuse: new Fuse(this.logs, {
                    keys: [
                        {name: 'message', weight: 0.5},
                        {name: 'sqlString', weight: 0.4},
                        {name: 'displayStartTime', weight: 0.1},
                        {name: 'displayEndTime', weight: 0.1}
                    ]
                })
            }
        },

        methods: {
            toggleItem(item) {
                item.setState('open', ! item.isOpen);
            },

            toggleSettings() {
                this.showSettings = !this.showSettings;
            },

            clearLogs() {
                if(! this.log || ! this.database) {
                    return;
                }

                this.log.clear(this.database.name);
            }
        },

        computed: {
            filteredRows() {
                let rows = this.rows;

                if(this.search) {
                    this.fuse.setCollection(this.rows);
                    rows = this.fuse.search(this.search);
                }

                return rows.filter(item => {
                    if(this.levels.length <= 0) {
                        return false;
                    } else if(this.levels.indexOf(item.type) < 0) {
                        return false;
                    }

                    return true;
                });
            },

            hiddenCount() {
                return this.rows.length - this.filteredRows.length;
            },

            emptyLog() {
                return this.rows.length <= 0;
            },

            search: {
                get() {
                    return this.log.getState('search');
                },
                set(val) {
                    this.log.setState('search', val);
                }
            },

            levels: {
                get() {
                    return this.log.getState('levels');
                },
                set(levels) {
                    this.log.setState('levels', levels);
                }
            },

            showSettings: {
                get() {
                    return this.log.getState('showSettings');
                },
                set(val) {
                    this.log.setState('showSettings', val);
                }
            }

        }

    }

</script>

<style lang="scss" scoped>
    @import "../scss/variables";

    .sp-log-header {
        display: flex;
        padding: 5px;
        border-bottom: 1px solid $--color-border-main-header;
        width: 100%;
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 5px;
        box-shadow: $--box-shadow-light;

        .action {
            margin-right: 5px;
            padding: 3px 9px;
            font-size: 21px;

            &.is-end {
                margin-right: 0;
                margin-left: 5px;
            }
        }

        .form {
            display: flex;
            flex-grow: 1;
            flex-shrink: 1;

            .form-item {
                margin-right: 5px;
            }

            .levels-select {
                width: 123px;
            }

            .search {
                width: 150px;
            }
        }

        .count-message {
            font-size: 0.8em;
            color: $--color-text-secondary;
        }

    }

    .sp-log-settings {
        display: flex;
        padding: 15px 5px;
        border-bottom: 2px solid $--color-border-main-header;
        width: 100%;
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 5px;
    }

    .el-scrollbar {
        overflow: hidden;
        position: relative;
        width: 100%;
        height: 100%;
        flex-grow: 1;
        flex-shrink: 1;
    }

    .sp-log-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        background-color: $--color-white;
        font-size: 0.9em;

        &.is-empty {
            align-items: center;
            justify-content: center;
        }

    }

    .empty-message {
        flex-direction: column;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        flex-shrink: 0;

        > div {
            flex: 0;
        }

        .log-message {
            margin: 0;
            font-weight: 400;
            color: $--color-primary;
        }

        svg {
            width: 150px;
        }

    }

    .log-list {

        .toggle-icon {
            cursor: pointer;
        }

        .log-list-item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
            padding: 5px 5px 10px;
            margin-bottom: 5px;
            border-bottom: 2px solid $--color-border-main-main-aside;
            box-sizing: border-box;

            &-error {
                .message-line {
                    color: $--color-danger;
                }

                .icon {
                    color: $--color-danger;
                }
            }
        }

        .icon {
            margin-right: 10px;
            font-size: 1.3em;
            color: $--color-text-secondary;

            i {
                display: block;
                line-height: 1;
            }
        }

        .lines {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            flex-shrink: 1;
            flex-grow: 0;
            width: 100%;

            .sql-line {
                background-color: $--color-background-main-header;
                border: 1px solid $--color-border-main-header;
                border-left-width: 10px;
                width: 100%;
                padding: 5px;
                box-sizing: border-box;
            }

            .line {
                display: flex;
                align-items: flex-start;
                justify-content: flex-start;
                margin-bottom: 3px;

                .label {
                    width: 62px;
                    flex-grow: 0;
                    flex-shrink: 0;
                    text-align: right;
                    margin-right: 5px;
                }

            }

        }

        .head-line {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            flex-grow: 1;
            flex-shrink: 0;
            width: 100%;
            font-size: 0.9em;
            color: $--color-text-secondary;
            font-weight: 400;
        }

        .meta-line {
            display: flex;
            margin-top: 5px;
            font-size: 0.8em;

            .item {
                color: $--color-text-secondary;

                &:not(:last-child) {
                    margin-right: 5px;
                    padding-right: 5px;
                    border-right: 1px solid $--color-text-secondary;
                }

                .label {
                    font-weight: 800;
                }

            }
        }

    }

</style>