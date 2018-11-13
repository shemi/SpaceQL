<template>
    <div id="app">

        <el-container class="main-app-container">
            <tabs-nav></tabs-nav>

            <el-header class="app-header">
                <main-header></main-header>
            </el-header>

            <el-container class="app-page-container">

                <transition name="spq-show-from-top">
                    <div class="create-modal-wrap" v-if="dynamicModal">
                        <div class="create-modal-container">
                            <div class="create-modal">
                                <component :is="dynamicModal"></component>
                            </div>
                        </div>
                        <div class="create-modal-backdrop" @click="close"></div>
                    </div>
                </transition>

                <el-aside class="page-aside" width="200px">
                    <router-view name="aside"></router-view>
                </el-aside>

                <el-container class="page-main-content">
                    <el-main>
                        <router-view :key="$route.fullPath"></router-view>
                    </el-main>
                </el-container>

            </el-container>

        </el-container>

    </div>

</template>

<script>
    import MainHeader from './components/MainHeader';
    import TabsNav from './components/TabNav';
    import Service from "./Service";
    import SpCreateTableModal from './components/CreateTable';
    import SpqlCreateDatabase from './components/CreateDatabase';

    export default {
        name: "SpaceQL",

        data() {
            return {
                // dynamicModal: null
            }
        },

        watch: {

        },

        created() {
            Service.send('TabsController@closeAll');
        },

        methods: {
            close() {
                if(! this.tab) {
                    return;
                }

                this.tab.setDynamicModal(null);
            }
        },

        computed: {
            tab() {
                if(! this.$route || ! this.$route.params || ! this.$route.params.tabId) {
                    return null;
                }

                return this.$store.getters['Tabs/getTabById'](parseInt(this.$route.params.tabId));
            },

            dynamicModal() {
                if(! this.tab) {
                    return null;
                }

                return this.tab.dynamicModalName;
            }
        },

        components: {
            MainHeader,
            TabsNav,
            SpCreateTableModal,
            SpqlCreateDatabase
        }

    };
</script>

<style lang="scss" scoped>
    @import "scss/variables";

    .app-page-container {
        position: relative;
    }

    .create-modal-wrap {
        position: absolute;
        left: 0;
        bottom: 0;
        top: 0;
        right: 0;
        z-index: 900;
        overflow: hidden;
    }

    .create-modal-backdrop {
        position: absolute;
        left: 0;
        bottom: 0;
        top: 0;
        right: 0;
        background-color: rgba($--color-black, 0.6);
        z-index: 1;
    }

    .create-modal-container {
        position: absolute;
        max-width: 350px;
        top: 0;
        left: 50%;
        right: 0;
        z-index: 2;
        overflow: hidden;
        transform: translate(-50%, 0);

        .create-modal {
            position: relative;
            background-color: white;
            z-index: 2;
            padding: 10px 5px;
            border-radius: 0 0 5px 5px;
            box-shadow: $--box-shadow-dark;
        }
    }

    .spq-show-from-top-enter-active,
    .spq-show-from-top-leave-active {
        &,
        .create-modal-container,
        .create-modal-backdrop {
            transition: $--md-fade-transition;
        }
    }

    .spq-show-from-top-enter,
    .spq-show-from-top-leave,
    .spq-show-from-top-leave-active {
        .create-modal-container {
            opacity: 0;
            transform: translate(-50%, -100%);
        }

        .create-modal-backdrop {
            opacity: 0;
        }
    }

</style>
