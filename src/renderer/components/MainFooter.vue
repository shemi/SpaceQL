<template>

    <div class="sp-main-footer">

        <div class="sp-main-footer-controls">
            <div class="footer-action is-icon">
                <i class="el-icon-refresh"></i>
            </div>

            <a class="footer-action is-icon">
                <i class="el-icon-sort"></i>
            </a>

            <a class="footer-action is-icon">
                <i class="el-icon-remove"></i>
            </a>
        </div>

        <div class="sp-main-footer-log">

            <router-link :to="`/${tabId}/connection/log`" class="last-log-message">
                <span v-if="lastLog">
                    {{ lastLog.message | truncate(150) }}
                </span>
            </router-link>

            <el-badge :value="unreadLogsCount" :max="9" :hidden="unreadLogsCount <= 0" class="footer-action has-icon">
                <router-link :to="`/${tabId}/connection/log`" active-class="is-active">
                    <i class="el-icon-bell"></i>
                    <span>Log</span>
                </router-link>
            </el-badge>

        </div>

    </div>

</template>

<script>
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';
    import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../../utils/constants";

    export default {

        mixins: [GeneralComputedMixin],

        data() {
            return {
                logTypeIcons: {
                    [LOG_TYPE_ERROR]: 'bla',
                    [LOG_TYPE_WARNING]: 'bla',
                    [LOG_TYPE_INFO]: 'bla',
                }
            }
        },

        computed: {
            unreadLogsCount() {
                if(! this.tab || ! this.tab.log || this.tab.log.logs.length <= 0) {
                    return 0;
                }

                let count = 0;

                for(let log of this.tab.log.logs) {
                    if(! log.read) {
                        count++;
                    }
                }

                return count;
            },

            lastLog() {
                if(! this.tab || ! this.tab.log || this.tab.log.logs.length <= 0) {
                    return null;
                }

                return this.tab.log.logs[this.tab.log.logs.length - 1];
            }
        },

        filters: {
            truncate (value, length) {
                length = length || 15;

                if( !value || typeof value !== 'string' ) {
                    return '';
                }

                if( value.length <= length) {
                    return value;
                }

                return value.substring(0, length) + '...';
            }
        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .sp-main-footer {
        display: flex;
        font-size: 0.95em;
        padding: 0 20px 0 0;
        background-color: $--color-background-main-aside;
        border-top: 1px solid $--color-border-main-header;
        flex-grow: 0;
        flex-shrink: 0;

        .sp-main-footer-controls {
            display: flex;
            width: 40%;
        }

        .sp-main-footer-log {
            display: flex;
            width: 60%;
            justify-content: space-between;
        }

        .last-log-message {
            flex-grow: 1;
            flex-shrink: 1;
            color: $--color-black;
            font-size: 0.8em;
            text-decoration: none;
            line-height: 1;
            padding: 5px;
            border-left: 2px solid $--color-border-main-header;
            height: 31px;
            overflow: hidden;
            box-sizing: border-box;
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