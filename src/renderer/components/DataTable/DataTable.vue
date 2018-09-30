<template>

    <div class="snr-data-table">

        <data-table-header :columns="columns"
                           :order="order">
        </data-table-header>

        <div class="data-table-content">

            <data-table-row :columns="columns">

            </data-table-row>

        </div>


    </div>

</template>

<script>
    import DataTableHeader from './DataTableHeader';
    import DataTableRow from './DataTableRow';

    export default {

        props: {
            columns: Array,
            content: Array,
            editable: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                order: {}
            }
        },

        created() {

        },

        components: {
            DataTableHeader,
            DataTableRow
        }

    }

</script>

<style lang="scss">
    @import "../../scss/variables";

    .data-table {

        .data-table-row {

        }

        .data-table-cell {

        }

    }

</style>