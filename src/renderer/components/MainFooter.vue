<template>

    <div class="sp-main-footer">

        <div class="sp-main-footer-controls">
            <slot></slot>
        </div>

        <div class="sp-main-footer-log">

            <router-link :to="`/${tabId}/connection/log`" class="last-log-message" v-if="lastLog">
                <i :class="['message-icon', 'message-icon-' + lastLog.type, 'el-icon-' + lastLog.type]"></i>
                <span>
                    {{ lastLog.message | truncate(125) }}
                </span>
            </router-link>

            <el-badge :value="errorLogsCount" :max="9" :hidden="errorLogsCount <= 0" class="log-link footer-action has-icon">
                <router-link :to="`/${tabId}/connection/log`" active-class="is-active">
                    <i class="el-icon-bell"></i>
                    <span>Log</span>
                </router-link>
            </el-badge>

        </div>

    </div>

</template>

<script>
    import LogComputedMixin from '../mixins/LogComputedMixin';
    import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../../utils/constants";

    export default {

        mixins: [LogComputedMixin],

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
        height: 32px;

        .sp-main-footer-controls {
            display: flex;
            width: 40%;
        }

        .sp-main-footer-log {
            display: flex;
            width: 60%;
            justify-content: flex-end;
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
            display: flex;
            align-items: center;

            .message-icon {
                margin-right: 2px;

                &-error {
                    color: $--color-danger;
                }

                &-info {
                    color: $--color-info;
                }
            }

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