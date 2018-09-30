<template>

    <div class="data-table-cell"></div>

</template>

<script>

    export default {

        props: {
            value: {
                type: [String, Number, Boolean],
                default: null
            },
            editable: {
                type: Boolean,
                default: false
            },
            rowIndex: Number,
            cellIndex: Number
        },

        data() {
            return {

            }
        }

    }

</script>