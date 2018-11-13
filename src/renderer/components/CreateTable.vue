<template>

    <div class="dynamic-modal dynamic-modal--create-table">

        <el-form ref="form" :model="form" @submit.native.prevent="createTable">
            <el-form-item required="">
                <el-input v-model="form.name"
                          ref="firstInput"
                          autofocus
                          placeholder="Name"></el-input>
            </el-form-item>
            <el-form-item class="actions">
                <el-button size="small" @click="close">Close</el-button>
                <el-button type="primary" native-type="submit"
                           size="mini"
                           :loading="loading"
                           :disabled="! form.name">
                    Create
                </el-button>
            </el-form-item>
        </el-form>

    </div>

</template>

<script>
    import GeneralComputedMixin from '../mixins/GeneralComputedMixin';

    export default {

        name: 'SpCreateTableModal',

        mixins: [GeneralComputedMixin],

        data() {
            return {
                loading: false,
                form: {
                    name: ''
                }
            }
        },

        created() {
            this.$nextTick(() => {
                if(! this.$refs.firstInput) {
                    return;
                }

                this.$refs.firstInput.focus();
            });
        },

        methods: {
            createTable() {
                if(! this.form.name || ! this.database) {
                    return;
                }

                this.loading = true;

                this.database.createTable(this.form)
                    .then(res => {
                        this.loading = false;
                    })
                    .catch(err => {
                        this.loading = false;
                    });
            },

            close() {
                this.tab.setDynamicModal(null);
            }
        }

    }

</script>

<style lang="scss" scoped>
    .el-form-item.actions {
        margin: 0;
    }
</style>