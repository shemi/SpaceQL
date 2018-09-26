<template>

    <div class="el-tabs el-tabs--top">

        <div class="el-tabs__header is-top">
            <span class="el-tabs__new-tab" @click="handleTabAdd" tabindex="0">
                <i class="el-icon-plus"></i>
            </span>

            <tab-nav :current-name="currentName"
                     ref="nav"
                     :onTabClick="handleTabClick"
                     :onTabRemove="handleTabRemove">
            </tab-nav>
        </div>

    </div>

</template>

<script>
    import TabNav from '../tab-nav';

    export default {
        name: 'snr-tabs',

        components: {
            TabNav
        },

        props: {
            activeName: String,
            value: {}
        },

        provide() {
            return {
                rootTabs: this
            };
        },

        data() {
            return {
                currentName: this.value || this.activeName,
                panes: []
            };
        },

        watch: {
            activeName(value) {
                this.setCurrentName(value);
            },

            value(value) {
                this.setCurrentName(value);
            },

            currentName(value) {
                if (this.$refs.nav) {
                    this.$nextTick(_ => {
                        this.$refs.nav.scrollToActiveTab();
                    });
                }
            }
        },

        methods: {
            handleTabClick(tab, tabName, event) {
                if (tab.disabled) {
                    return;
                }

                this.setCurrentName(tabName);
                this.$emit('tab-click', tab, event);
            },

            handleTabRemove(pane, ev) {
                if (pane.disabled) {
                    return;
                }

                ev.stopPropagation();
                this.$emit('edit', pane.name, 'remove');
                this.$emit('tab-remove', pane.name);
            },

            handleTabAdd() {
                this.$emit('edit', null, 'add');
                this.$emit('tab-add');
            },

            setCurrentName(value) {
                this.currentName = value;
            },

            addPanes(item) {
                const index = this.$slots.default.filter(item => {
                    return item.elm.nodeType === 1 && /\bel-tab-pane\b/.test(item.elm.className) || item.elm.nodeType === 8;
                }).indexOf(item.$vnode);

                this.panes.splice(index, 0, item);
            },

            removePanes(item) {
                const panes = this.panes;
                const index = panes.indexOf(item);

                if (index > -1) {
                    panes.splice(index, 1);
                }
            }
        },

        created() {
            if (! this.currentName) {
                this.setCurrentName('0');
            }
        }
    };
</script>
