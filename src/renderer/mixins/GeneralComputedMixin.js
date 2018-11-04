export default {

    data() {
        return {
            tab: null
        }
    },

    created() {
        this.tab = this.$store.getters['Tabs/getTabById'](parseInt(this.$route.params.tabId));
    },

    computed: {

        tabId() {
            return this.tab ? this.tab.id : '';
        },

        connection() {
            return this.tab ? this.tab.connection : null;
        },

        database() {
            return this.connection ? this.connection.selectedDatabase : null;
        },

        table() {
            return this.database ? this.database.selectedTable : null;
        },

    }

};