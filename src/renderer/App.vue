<template>
    <div id="app">

        <el-container class="main-app-container">
            <el-header class="app-header">
                <main-header></main-header>
            </el-header>

            <el-container class="app-page-container">

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

    export default {
        name: "sonarr-pro",

        components: {
            MainHeader
        }

    };
</script>

<style>
    /* CSS */
</style>
