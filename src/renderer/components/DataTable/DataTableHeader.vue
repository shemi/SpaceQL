<template>

    <div class="data-table-header">

        <div class="data-table-row data-table-header-row">

            <div v-for="column in columns"
                 :key="column.name"
                 class="data-table-cell data-table-header-cell">
                {{ column.name }}
            </div>

        </div>

    </div>

</template>

<script>

    export default {

        props: {
            columns: Array,
            order: Object
        },

    }

</script>

<style lang="scss">

    .data-table .data-table-header {



    }

</style>