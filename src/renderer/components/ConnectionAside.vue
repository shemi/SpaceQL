<template>

    <div>

        <ul class="tables-list" v-if="tables">

            <li v-for="table in tables.all()" :key="table.name">
                {{ table.name }}
            </li>

        </ul>

    </div>

</template>

<script>

    export default {

        computed: {
            tab() {
                return this.$store.getters['Tabs/currentTab'];
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

            tables() {
                return this.database ? this.database.tables : null;
            }

        }

    }

</script>

<style lang="scss">



</style>