<template>

    <div>Loading...</div>

</template>

<script>

    export default {

        created() {
            this.$store.dispatch('Tabs/create')
                .then(tab => {
                    this.$router.replace('/' + tab.id);
                });
        }

    }

</script>