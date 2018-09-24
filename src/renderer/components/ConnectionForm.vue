<template>

    <div class="connection-form-card">

        <div class="connection-form-header">
            <el-radio-group v-model="form.connectionType" size="mini">
                <el-radio-button label="tcp">Standard</el-radio-button>
                <el-radio-button label="socket" disabled>Socket</el-radio-button>
                <el-radio-button label="ssh">SSH</el-radio-button>
            </el-radio-group>
        </div>

        <div class="connection-form-content">
            <el-form ref="form" :model="form" label-width="120px" size="mini">

                <template v-if="isFavorite">
                    <el-form-item label="Name">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <div class="color-selector">
                            <label class="color-selector-item"
                                   v-for="color in colors"
                                   :title="color.name"
                                   :key="color.color">
                                <input type="radio" v-model="form.color" :value="color.color">
                                <span class="color-bubble" :style="{backgroundColor: color.color}">
                                    <i class="check-mark el-icon-check"></i>
                                </span>
                            </label>
                        </div>
                    </el-form-item>
                </template>

                <el-form-item label="DB Host" class="host-port-fields">
                    <el-col :span="16">
                        <el-input v-model="form.dbHost"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-input-number v-model="form.dbPort" controls-position="right" placeholder="Port"></el-input-number>
                    </el-col>
                </el-form-item>

                <el-form-item label="Username">
                    <el-input v-model="form.dbUsername"></el-input>
                </el-form-item>

                <el-form-item label="Password">
                    <el-input v-model="form.dbPassword" type="password" clearable></el-input>
                </el-form-item>

                <el-form-item label="Database">
                    <el-input v-model="form.dbName" placeholder="optional" clearable></el-input>
                </el-form-item>

                <template v-if="form.connectionType === 'ssh'">
                    <div class="form-divider"></div>

                    <el-form-item label="SSH Host" class="host-port-fields">
                        <el-col :span="16">
                            <el-input v-model="form.sshHost"></el-input>
                        </el-col>
                        <el-col :span="8">
                            <el-input-number v-model="form.sshPort" controls-position="right" placeholder="SSH Port"></el-input-number>
                        </el-col>
                    </el-form-item>

                    <el-form-item label="SSH User">
                        <el-input v-model="form.sshUsername"></el-input>
                    </el-form-item>

                    <el-form-item label="SSH Password">
                        <el-input v-model="form.sshPassword" type="password" clearable></el-input>
                    </el-form-item>

                    <el-form-item label="SSH Key File">
                        <el-input v-model="form.sshKeyFilePath" clearable>
                            <el-button slot="append"
                                       @click="getFilePath('sshKeyFilePath', 'Select SSH key file')"
                                       icon="el-icon-more"></el-button>
                        </el-input>
                    </el-form-item>

                </template>

            </el-form>
        </div>

        <div class="connection-form-footer">
            <el-row class="links-actions">
                <el-button size="mini"
                           :loading="saving"
                           v-if="isExistsFavorite"
                           @click="saveFavorite"
                           round>Save</el-button>

                <el-button size="mini"
                           :loading="saving"
                           v-if="isExistsFavorite"
                           @click="deleteFavorite"
                           round>Delete</el-button>

                <el-button size="mini" round
                           @click="testConnection"
                           :loading="testLoading">Test Connection</el-button>
            </el-row>

            <el-button v-if="newFavorite"
                       type="primary"
                       :loading="saving"
                       @click="saveFavorite"
                       :disabled="busy">Save</el-button>

            <el-button v-else
                       type="primary"
                       @click="connect"
                       :disabled="busy">
                Connect
            </el-button>
        </div>

    </div>

</template>

<script>
    import path from 'path';
    import {
        TEST_CONNECTION,
        CONNECT
    } from '../../utils/main-events';
    import { COLORS } from "../../utils/constants";
    import service from '../Service';
    import { createNamespacedHelpers } from 'vuex';

    const { mapGetters, mapActions } = createNamespacedHelpers('Favorite');

    const crateConnectionForm = (data = {}) => {
        return Object.assign({
            name: '',
            color: 'black',
            connectionType: 'tcp',
            driver: 'mysql',
            dbHost: '127.0.0.1',
            dbPort: '3306',
            dbName: '',
            dbUsername: 'root',
            dbPassword: '',
            sshHost: '127.0.0.1',
            sshPort: '22',
            sshUsername: 'user',
            sshPassword: '',
            sshKeyFilePath: '',
            socketPath: ''
        }, data)
    };

    export default {

        props: {
            newFavorite: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                form: crateConnectionForm(),
                busy: false,
                testLoading: false,
                saving: false,
                colors: COLORS
            }
        },

        created() {
            if(this.$route.params.id) {
                let favorite = this.$store.getters['Favorite/getFavoriteById'](this.$route.params.id);

                if(! favorite || ! favorite.id) {
                    this.$router.push('/');
                }

                this.form = crateConnectionForm(favorite);
            }
        },

        methods: {
            ...mapActions([
                'saveFavorite'
            ]),

            deleteFavorite() {
                let id = this.id || this.$route.params.id;

                if(! id) {
                    return;
                }

            },

            saveFavorite() {
                if(this.saving) {
                    return;
                }

                this.saving = true;
                this.busy = true;

                this.$store.dispatch('Favorite/saveFavorite', this.form)
                    .then(favorite => {
                        this.saving = false;
                        this.busy = false;

                        if(this.newFavorite) {
                            this.$router.push({name: 'favorite-single', params: {id: favorite.id}});
                        }
                    })

            },

            testConnection() {
                if(this.testLoading || this.busy) {
                    return;
                }

                this.busy = true;
                this.testLoading = true;

                service.send(TEST_CONNECTION, this.form)
                    .then(res => {
                        this.busy = false;
                        this.testLoading = false;

                        let message = `
                            <p>Information related to this connection:</p>
                            <br>
                            <p>
                                <b>Host:</b> ${res.host}<br>
                                <b>Port:</b> ${res.port}<br>
                                <b>User:</b> ${res.user}<br>
                                <b>DB Version:</b> ${res.version}
                            </p>
                        `;

                        this.$alert(message, `Successfully made connection`, {
                            type: 'success',
                            dangerouslyUseHTMLString: true
                        });
                    })
                    .catch(err => {
                        this.busy = false;
                        this.testLoading = false;

                        this.$alert(`${err.message}`, `Connection failed`, {
                            type: 'error',
                        });
                    });
            },

            connect() {
                if(this.busy) {
                    return;
                }

                this.busy = true;

                this.$store.dispatch('Connection/connect', this.form)
                    .then(data => {
                        this.busy = false;
                        this.$router.push(`/connection/${data.id}`);
                    })
                    .catch(err => {
                        this.busy = false;

                        this.$alert(`${err.message}`, `Connection failed`, {
                            type: 'error',
                        });
                    });
            },

            getFilePath(formKey, title = '', buttonLabel='Select', defaultPath = '') {
                defaultPath = defaultPath || (this.form[formKey] || '');

                if(defaultPath && typeof defaultPath === 'string') {
                    defaultPath = path.dirname(defaultPath);
                }

                this.$electron.remote.dialog.showOpenDialog(
                    {
                        title,
                        defaultPath,
                        buttonLabel,
                        properties: ['openFile']
                    },
                    (filePaths) => {
                        if(! filePaths || ! Array.isArray(filePaths) || ! filePaths[0]) {
                            return;
                        }

                        this.$set(this.form, formKey, filePaths[0]);
                    }
                );
            }
        },

        computed: {
            ...mapGetters([
                'allFavorites',
                'currentFavorite'
            ]),

            isFavorite() {
                return this.newFavorite || this.$route.params.id;
            },

            isExistsFavorite() {
                return ! this.newFavorite && this.$route.params.id;
            }

        }

    }

</script>

<style lang="scss">
    @import "../scss/variables";

    .host-port-fields {
        .el-input-number--mini {
            width: 100%;
        }
    }

    .form-divider {
        border-bottom: 1px solid $--color-text-placeholder;
        max-width: 300px;
        margin: 0 auto 18px;
    }

    .connection-form-card {
        background-color: $--color-white;
        max-width: 500px;
        margin: 30px auto;
        border-radius: $--border-radius-base;
        box-shadow: $--box-shadow-base;
    }

    .connection-form-content {
        padding: 0 30px;
    }

    .connection-form-header {
        height: 34px;
        display: flex;
        justify-content: center;
        position: relative;

        .el-radio-group {
            position: absolute;
            bottom: 100%;
            transform: translateY(50%);
        }
    }

    .connection-form-footer {
        padding: 0 30px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .color-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .color-selector-item {
            position: relative;
            overflow: hidden;
            cursor: pointer;

            .color-bubble {
                display: flex;
                color: white;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 100%;
                flex-grow: 0;
                flex-shrink: 0;

                .check-mark {
                    opacity: 0;
                }
            }

            input {
                position: absolute;
                opacity: 0;

                &:checked + .color-bubble {
                    .check-mark {
                        opacity: 1;
                    }
                }

            }

        }
    }

</style>