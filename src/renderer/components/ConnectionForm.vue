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
                <el-button size="mini" round>Save</el-button>
                <el-button size="mini" round
                           @click="testConnection"
                           :loading="testLoading">Test Connection</el-button>
            </el-row>

            <el-button type="primary" :disabled="busy">Connect</el-button>
        </div>

    </div>

</template>

<script>
    import path from 'path';
    import {
        TEST_CONNECTION,
        CONNECT
    } from '../../utils/main-events';
    import service from '../Service';

    const crateConnectionForm = (data = {}) => {
        return {
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
        }
    };

    export default {

        data() {
            return {
                form: crateConnectionForm(),
                busy: false,
                testLoading: false,
            }
        },

        mounted() {

        },

        methods: {

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

</style>