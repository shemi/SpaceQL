<template>

    <div class="connection-content">
        <router-view :key="$route.fullPath"></router-view>
    </div>

</template>

<script>

    export default {

        data() {
            return {

            }
        },

        created() {
            if(! this.tab || ! this.connection) {
                this.$router.replace('/');
            }

        },

        computed: {
            tab() {
                return this.$store.getters['Tabs/currentTab'];
            },

            connection() {
                return this.tab ? this.tab['connection'] : null;
            }
        }

    }

</script>

<style lang="scss">

    .connection-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

</style>