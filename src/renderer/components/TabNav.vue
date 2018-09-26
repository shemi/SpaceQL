<template>

    <div class="el-tabs el-tabs--top">

        <div class="el-tabs__header is-top">
            <span class="el-tabs__new-tab" @click="handleTabAdd" tabindex="0">
                <i class="el-icon-plus"></i>
            </span>

            <div class="el-tabs__nav-wrap is-scrollable is-top">

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

                    <div class="el-tabs__nav is-top"
                         ref="nav"
                         :styl="navStyle"
                         role="tablist"
                         @keydown="changeTab">

                        <div class="el-tabs__item is-top is-closable"
                             :class="{'is-active': connection.isActive, 'is-focus': this.isFocus}"
                             :id="connection.id"
                             role="tab"
                             :aria-selected="connection.isActive"
                             ref="tabs"
                             tabindex={tabindex}
                             ref-in-for
                             @focus="() => {setFocus();}"
                             @blur="() => { removeFocus();}"
                             @click="(ev) => { removeFocus(); onTabClick(pane, tabName, ev); }"
                             @keydown="(ev) => { if (closable && (ev.keyCode === 46 || ev.keyCode === 8)) { onTabRemove(pane, ev);} }">

                            {{ connection.name }}

                            <span class="el-icon-close"
                                  @click="(ev) => { onTabRemove(pane, ev); }"></span>
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
            panes: Array,
            currentName: String,
            onTabClick: {
                type: Function,
                default: noop
            },
            onTabRemove: {
                type: Function,
                default: noop
            },
            type: String,
            stretch: Boolean
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
                    this.scrollable.prev = currentOffset;
                    this.scrollable.next = currentOffset + containerSize < navSize;

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
