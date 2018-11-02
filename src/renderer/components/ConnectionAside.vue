<template>

    <div class="connection-aside-container aside-container">


        <div class="aside-list" v-if="tables">
            <div v-for="item in tables.all()"
                 :key="item.name" class="aside-list-item">
                <a @click="selectTable(item)"
                   :class="{'is-active': table && item.name === table.name}"
                   class="aside-item">
                    <span>{{ item.name }}</span>
                </a>
            </div>
        </div>


    </div>

</template>

<script>
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';

    export default {

        mixins: [GeneralComputedMixin],

        methods: {
            selectTable(table) {
                if(! this.database) {
                    return;
                }

                this.database.selectTable(table);
            }
        },

        computed: {

            tables() {
                return this.database ? this.database.tables : null;
            }

        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .aside-item {
        color: black;
        text-decoration: none;
        padding: 10px 5px;
        display: block;
        cursor: pointer;

        &:hover {
            color: $--color-primary-light-2;
        }

        &.is-active {
            color: $--color-primary;
        }
    }

    .aside-list {
        .aside-list-item {
            border-bottom: 1px solid $--color-border-main-main-aside;

            .aside-item {
                display: flex;
                align-items: center;
                line-height: 0.9;
                font-size: 0.9em;
                padding: 8px 5px;
            }

            .svg-icon {
                margin-right: 6px;
            }

        }
    }

</style>