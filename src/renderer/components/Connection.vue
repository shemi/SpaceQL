<template>

    <div>

        <div class="el-tabs el-tabs--card el-tabs--top">
            <div class="el-tabs__header is-top">
                <span tabindex="0" class="el-tabs__new-tab"><i class="el-icon-plus"></i></span>

                <div class="el-tabs__nav-scroll">
                    <div role="tablist" class="el-tabs__nav is-top" style="transform: translateX(0px);"><div id="tab-1" aria-controls="pane-1" role="tab" tabindex="0" class="el-tabs__item is-top is-active is-closable" aria-selected="true">Tab 1<span class="el-icon-close"></span></div><div id="tab-3" aria-controls="pane-3" role="tab" tabindex="-1" class="el-tabs__item is-top is-closable">New Tab<span class="el-icon-close"></span></div></div>
                </div>

            </div>
        </div>

    </div>

</template>

<script>

    export default {

        created() {
            const connectionId = this.$route.params.id;

            if(! connectionId || ! this.$store.getters['Connection/getConnectionById'](connectionId)) {
                this.$router.replace('/');
            }

            this.$store.commit('Connection/SELECT', connectionId);
        },

        deactivated() {
            this.$store.commit('Connection/UNSELECT');
        }

    }

</script>

<style lang="scss">

</style>