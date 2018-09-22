<template>

    <div class="connection-aside-container aside-container">

        <div class="aside-header-action">
            <router-link :to="{name: 'quick-connection'}" class="aside-item icon-link">
                <span class="svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon
                        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
                <span>Quick Connection</span>
            </router-link>
        </div>

        <div class="aside-title-divider">
            <h3 class="divider-title">
                <span class="svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                <span>Favorites</span>
            </h3>

            <router-link :to="{name: 'favorite'}">
                <el-button icon="el-icon-plus" size="mini" circle></el-button>
            </router-link>
        </div>

        <div class="aside-list">
            <div v-for="favorite in allFavorites"
                 :key="favorite.id"
                 class="aside-list-item">
                <router-link :to="{name: 'favorite-single', params: {id: favorite.id}}" class="aside-item icon-link">
                    <span class="svg-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" :fill="favorite.color" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                    <span>{{ favorite.name }}</span>
                </router-link>
            </div>
        </div>

    </div>

</template>

<script>
    import {createNamespacedHelpers} from 'vuex';

    const {mapGetters, mapActions} = createNamespacedHelpers('Favorite');

    export default {
        data() {
            return {};
        },

        created() {
            this.loadFavorites();
        },

        methods: {
            ...mapActions([
                'loadFavorites'
            ])
        },

        computed: {
            ...mapGetters([
                'allFavorites'
            ])
        }

    };
</script>

<style lang="scss">
    @import "../scss/variables";

    .aside-item {
        color: black;
        text-decoration: none;
        padding: 10px 5px;
        display: block;

        &:hover {
            color: $--color-primary-light-2;
        }

        &.router-link-exact-active {
            color: $--color-primary;
        }
    }

    .aside-title-divider {
        padding: 10px 5px;
        border-top: 1px solid $--color-border-main-main-aside;
        border-bottom: 1px solid $--color-border-main-main-aside;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .divider-title {
            font-size: 1.1em;
            font-weight: 400;
            margin: 0;
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