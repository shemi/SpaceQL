<template>

    <div class="dynamic-modal dynamic-modal--create-table">

        <el-form ref="form"
                 :model="form"
                 label-width="100px"
                 @submit.native.prevent="createDatabase">

            <el-form-item label="Name">
                <el-input v-model="form.name"
                          ref="firstInput"
                          autofocus>
                </el-input>
            </el-form-item>

            <el-form-item label="Character Set">
                <el-select v-model="form.characterSet"
                           filterable
                           default-first-option
                           @change="characterSetsChanged"
                           placeholder="Select Character Set">
                    <el-option
                            v-for="item in connection.characterSets"
                            :key="item.name"
                            :label="item.name"
                            :value="item.name">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="Collation">
                <el-select v-model="form.collation"
                           filterable
                           default-first-option
                           placeholder="Select Collation">
                    <el-option
                            v-for="item in filteredCollations"
                            :key="item.id"
                            :label="item.name"
                            :value="item.name">
                    </el-option>
                </el-select>
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
    import find from 'lodash/find';

    export default {

        name: 'SpqlCreateDatabase',

        mixins: [GeneralComputedMixin],

        data() {
            return {
                loading: false,
                form: {
                    name: '',
                    characterSet: 'utf8mb4',
                    collation: 'utf8mb4_general_ci'
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
            createDatabase() {
                if(! this.form.name || ! this.database) {
                    return;
                }

                this.loading = true;

                this.connection.createDatabase(this.form)
                    .then(res => {
                        this.loading = false;
                        this.close();
                    })
                    .catch(err => {
                        this.loading = false;
                    });
            },

            characterSetsChanged() {
                let set = find(this.connection.characterSets, {name: this.form.characterSet});

                if(! set || ! set.default_collate) {
                    return;
                }

                this.$set(this.form, 'collation', set.default_collate);
            },

            close() {
                this.tab.setDynamicModal(null);
            }
        },

        computed: {
            filteredCollations() {
                if(! this.connection) {
                    return [];
                }

                return this.connection.collations.filter((item) => {
                    return item.character_set === this.form.characterSet;
                })
            }
        }

    }

</script>

<style lang="scss" scoped>
    .el-form-item.actions {
        margin: 0;
    }
</style>