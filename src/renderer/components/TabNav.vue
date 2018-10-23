<template>

    <div class="el-tabs el-tabs--card el-tabs--top">

        <div class="el-tabs__header is-top">
            <div class="el-tabs__new-tab">
                <el-button icon="el-icon-plus"
                           @click="handleTabAdd"
                           tabindex="0"
                           size="mini" circle>
                </el-button>
            </div>

            <div class="el-tabs__nav-wrap is-top" :class="{'is-scrollable': scrollable}">

                <template v-if="scrollable">
                    <span :class="['el-tabs__nav-prev', scrollable.prev ? '' : 'is-disabled']"
                          @click="scrollPrev">
                        <i class="el-icon-arrow-left"></i>
                    </span>
                    <span :class="['el-tabs__nav-next', scrollable.next ? '' : 'is-disabled']"
                          @click="scrollNext">
                        <i class="el-icon-arrow-right"></i>
                    </span>
                </template>

                <div class="el-tabs__nav-scroll" ref="navScroll">

                    <div class="el-tabs__nav is-top" ref="nav" :style="navStyle" role="tablist">

                        <div v-for="tab in tabs"
                             class="el-tabs__item is-top"
                             :class="{'is-active': tab.isActive, 'is-focus': isFocus, 'is-closable': tabs.length > 1}"
                             :id="tab.id"
                             role="tab"
                             :key="tab.id"
                             :aria-selected="tab.isActive"
                             ref="tabs"
                             ref-in-for
                             @focus="() => {setFocus();}"
                             @blur="() => { removeFocus();}"
                             @click="(ev) => { removeFocus(); handleTabClick(tab, ev); }"
                             @keydown="(ev) => { if (ev.keyCode === 46 || ev.keyCode === 8) { closeTab(tab, ev);} }">

                            {{ tab.displayName() }}

                            <span class="el-icon-close"
                                  v-if="tabs.length > 1"
                                  @click="closeTab(tab, $event)"></span>
                        </div>

                    </div>

                </div>

            </div>
        </div>

    </div>

</template>

<script>
    import {addResizeListener, removeResizeListener} from 'element-ui/src/utils/resize-event';

    function noop() {}

    export default {
        components: {},

        props: {

        },

        data() {
            return {
                scrollable: false,
                navOffset: 0,
                isFocus: false,
                focusable: true
            };
        },

        computed: {
            navStyle() {
                return {
                    transform: `translateX(-${this.navOffset}px)`
                };
            },

            tabs() {
                return this.$store.getters['Tabs/allTabs'];
            }
        },

        methods: {
            scrollPrev() {
                const containerSize = this.$refs.navScroll.offsetWidth;
                const currentOffset = this.navOffset;

                if (! currentOffset) {
                    return;
                }

                this.navOffset = currentOffset > containerSize
                    ? currentOffset - containerSize
                    : 0;
            },

            scrollNext() {
                const navSize = this.$refs.nav.offsetWidth;
                const containerSize = this.$refs.navScroll.offsetWidth;
                const currentOffset = this.navOffset;

                if (navSize - currentOffset <= containerSize) {
                    return;
                }

                this.navOffset = navSize - currentOffset > containerSize * 2
                    ? currentOffset + containerSize
                    : (navSize - containerSize);
            },

            scrollToActiveTab() {
                if (!this.scrollable) {
                    return;
                }

                const nav = this.$refs.nav;
                const activeTab = this.$el.querySelector('.is-active');

                if (!activeTab) {
                    return;
                }

                const navScroll = this.$refs.navScroll;
                const activeTabBounding = activeTab.getBoundingClientRect();
                const navScrollBounding = navScroll.getBoundingClientRect();
                const navBounding = nav.getBoundingClientRect();
                const currentOffset = this.navOffset;

                let newOffset = currentOffset;

                if (activeTabBounding.left < navScrollBounding.left) {
                    newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left);
                }

                if (activeTabBounding.right > navScrollBounding.right) {
                    newOffset = currentOffset + activeTabBounding.right - navScrollBounding.right;
                }

                if (navBounding.right < navScrollBounding.right) {
                    newOffset = nav.offsetWidth - navScrollBounding.width;
                }

                this.navOffset = Math.max(newOffset, 0);
            },

            handleTabClick(tab, event) {
                this.$store.commit('Tabs/SET', tab);
                let route = tab.lastRoute || `/${tab.id}/`;

                this.$router.replace(route);

                this.$nextTick(() => {
                    setTimeout(() => {
                        this.scrollToActiveTab();
                    }, 50);
                });
            },

            closeTab(tab, e) {
                e.stopPropagation();

                const tabIndex = this.tabs.indexOf(tab);

                if(this.tabs.length <= 1) {
                    return;
                }

                if(tab.isActive) {
                    if(tabIndex === (this.tabs.length - 1)) {
                        this.handleTabClick(this.tabs[tabIndex-1]);
                    }

                    else if(tabIndex < (this.tabs.length - 1)) {
                        this.handleTabClick(this.tabs[tabIndex+1]);
                    }

                    else if(tabIndex === 0) {
                        this.handleTabClick(this.tabs[0]);
                    }
                }

                this.$store.dispatch('Tabs/remove', tab);
            },

            handleTabAdd() {
                this.$store.commit('Tabs/UNSET');
                this.$router.replace('/');

                this.$nextTick(() => {
                    setTimeout(() => {
                        this.scrollToActiveTab();
                    }, 50);
                });
            },

            update() {
                if (!this.$refs.nav) {
                    return;
                }

                const navSize = this.$refs.nav.offsetWidth;
                const containerSize = this.$refs.navScroll.offsetWidth;
                const currentOffset = this.navOffset;

                if (containerSize < navSize) {
                    const currentOffset = this.navOffset;

                    this.scrollable = this.scrollable || {};
                    this.scrollable.next = currentOffset;
                    this.scrollable.prev = currentOffset + containerSize < navSize;

                    if (navSize - currentOffset < containerSize) {
                        this.navOffset = navSize - containerSize;
                    }

                } else {
                    this.scrollable = false;

                    if (currentOffset > 0) {
                        this.navOffset = 0;
                    }
                }
            },

            changeTab(e) {
                const keyCode = e.keyCode;

                let nextIndex;
                let currentIndex, tabList;

                if ([37, 38, 39, 40].indexOf(keyCode) !== -1) { // 左右上下键更换tab
                    tabList = e.currentTarget.querySelectorAll('[role=tab]');
                    currentIndex = Array.prototype.indexOf.call(tabList, e.target);
                } else {
                    return;
                }

                if (keyCode === 37 || keyCode === 38) { // left
                    if (currentIndex === 0) { // first
                        nextIndex = tabList.length - 1;
                    } else {
                        nextIndex = currentIndex - 1;
                    }
                } else { // right
                    if (currentIndex < tabList.length - 1) { // not last
                        nextIndex = currentIndex + 1;
                    } else {
                        nextIndex = 0;
                    }
                }

                tabList[nextIndex].focus(); // 改变焦点元素
                tabList[nextIndex].click(); // 选中下一个tab

                this.setFocus();
            },

            setFocus() {
                if (this.focusable) {
                    this.isFocus = true;
                }
            },

            removeFocus() {
                this.isFocus = false;
            },

            visibilityChangeHandler() {
                const visibility = document.visibilityState;

                if (visibility === 'hidden') {
                    this.focusable = false;
                }

                else if (visibility === 'visible') {
                    setTimeout(() => {
                        this.focusable = true;
                    }, 50);
                }
            },

            windowBlurHandler() {
                this.focusable = false;
            },

            windowFocusHandler() {
                setTimeout(() => {
                    this.focusable = true;
                }, 50);
            }

        },

        updated() {
            this.update();
        },

        mounted() {
            addResizeListener(this.$el, this.update);
            document.addEventListener('visibilitychange', this.visibilityChangeHandler);
            window.addEventListener('blur', this.windowBlurHandler);
            window.addEventListener('focus', this.windowFocusHandler);
        },

        beforeDestroy() {
            if (this.$el && this.update) {
                removeResizeListener(this.$el, this.update);
            }

            document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
            window.removeEventListener('blur', this.windowBlurHandler);
            window.removeEventListener('focus', this.windowFocusHandler);
        }
    };
</script>

<style lang="scss" scoped>
    @import "../scss/variables";

    $main-tabs-background-color: #e7e9ec;
    $main-tabs-borders-color: #d2d5db;


    .el-tabs {
        position: relative;
        background-color: $main-tabs-background-color;
        overflow: hidden;
    }

    .el-tabs__header {
        margin: 0;
        padding: 0 5px;
        border-bottom: 0;
        position: relative;
        /*overflow: hidden;*/

        &:after {
            content: "";
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            top: 100%;
            box-shadow: 0 -1px 16px 0px rgba(0, 0, 0, 0.5);
            z-index: 1;
        }

        .el-tabs__nav-wrap {
            position: relative;
            z-index: 2;
        }

        .el-tabs__new-tab {
            color: black;
            border: 0;
            border-radius: 0;
            height: auto;
            width: auto;
            line-height: 1;
            margin: 6.74px 0 6.74px 5px;
            text-align: center;
            font-size: 22px;

            .el-button:not(:hover) {
                background-color: $--color-background-main-header;
            }

        }

    }


    .el-tabs--card > .el-tabs__header {
        .el-tabs__nav {

        }

        .el-tabs__item {
            border-radius: 10px 10px 0 0;

            &:hover {
                background-color: rgba($--color-background-main-header, 0.5);
            }

            &.is-active {
                background-color: $--color-background-main-header;
                border-bottom-color: $--color-background-main-header;
            }
        }
    }

    .el-tabs__nav-next,
    .el-tabs__nav-prev {
        z-index: 5;
        background-color: $main-tabs-background-color;
        color: $--color-black;

        &.is-disabled {
            color: rgba($--color-black, 0.5);
        }

    }

</style>
