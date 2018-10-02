<template>

    <div :style="style" class="data-table-cell">
        <div class="cell-content">
            {{ value || 'NULL' }}
        </div>
    </div>

</template>

<script>

    export default {

        props: {
            value: {
                type: [String, Number, Boolean, Object],
                default: null
            },
            editable: {
                type: Boolean,
                default: false
            },
            rowIndex: Number,
            cellIndex: Number,
            cellStyle: Object
        },

        data() {
            return {

            }
        },

        computed: {
            style() {
                if(! this.cellStyle && ! this.cellStyle[this.cellIndex]) {
                    return {};
                }

                return {
                    ...this.cellStyle[this.cellIndex]
                }
            }
        }

    }

</script>