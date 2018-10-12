<template>

    <div class="snr-table-content-container">

        <data-table :columns="columns" sortable editable
                    :loading="loading"
                    :content="content">
        </data-table>

    </div>

</template>

<script>
    import DataTable from './DataTable/DataTable';

    export default {

        data() {
            return {
                loading: false,
                query: {},
                order: {},
                limit: 100,
                loaded: false
            }
        },

        watch: {
            table: {
                handler(table) {
                    this.fetchContent();
                },
                deep: false,
                immediate: true
            }
        },

        methods: {
            fetchContent() {
                if(! this.table || this.loaded) {
                    return;
                }

                this.loading = true;
                // this.loaded = true;

                this.table.getContent(this.query, this.order, this.limit)
                    .then(table => {
                        this.loading = false;
                    })
                    .catch(err => {
                        console.log('table', err);
                    })
            }
        },

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

            table() {
                return this.database ? this.database.selectedTable : null;
            },

            columns() {
                return this.table ? this.table.columns.all() : [];
            },

            content() {
                return this.table ? this.table.content.all() : [];
            }

        },

        components: {
            DataTable
        }

    }

</script>

<style>

    .snr-table-content-container {
        display: flex;
        height: 100%;
        flex-direction: column;
    }

</style>