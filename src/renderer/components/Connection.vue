<template>

    <div>



    </div>

</template>

<script>

    export default {

        created() {
            const connectionId = this.$route.params.id;

            if(! connectionId || ! this.$store.getters['Connection/getConnectionById'](connectionId)) {
                this.$router.replace('/');
            }

            this.$store.commit('Connection/SELECT', connectionId);
        },

        deactivated() {
            this.$store.commit('Connection/UNSELECT');
        }

    }

</script>

<style lang="scss">

</style>