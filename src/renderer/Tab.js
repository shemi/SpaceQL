import uuid from 'uuid/v4';
import Service from "./Service";
import Connection from './Connection';
import {TAB_CONNECTION_FORM} from "../utils/constants";

export default class Tab {

    constructor(id, data = null) {
        this.id = id;
        this.connection = null;
        this.table = null;
        this.favorite = null;
        this.query = '';
        this.isActive = false;
        this.name = 'New Tab';
        this.color = null;
        this.position = 999;
        this.hasConnection = false;
        this.type = TAB_CONNECTION_FORM;
        this.lastRoute = null;

        this.nameDuplication = 0;
        this.connectionForm = Tab.createConnectionForm();

        if(this.connection) {
            this.connection.setTab(this);
        }
    }

    setData(data) {
        let {connection, position,
            table, favorite, query} = data;

        if(connection) {
            this.connection = connection;
        }

        if(table) {
            this.table = table;
        }

        if(favorite) {
            this.favorite = favorite || {};
        }

        if(query) {
            this.query = query || '';
        }

        if(this.favorite) {
            this.name = this.favorite.name;
            this.color = this.favorite.color;
        }
        else if(this.connection)  {
            this.name = this.connection.name;
        }

        if(position) {
            this.position = position || 0;
        }
    }

    updateConnectionForm(favorite) {
        this.connectionForm = Tab.createConnectionForm(favorite);
    }

    setRoute(path) {
        this.lastRoute = path;
    }

    static async create() {
        const id = await Service.send('TabsController@create');

        return new Tab(id);
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    setDuplications(number) {
        this.nameDuplication = number;
    }

    displayName() {
        let name = '';

        if(! this.hasConnection) {
            return this.name;
        }

        if(this.nameDuplication > 0) {
            name += `#${this.nameDuplication} `;
        }

        if(this.table) {
            name += this.table + ' - ';
        }

        return name + this.name;
    }

    close() {
        Service.send('Tabs@close', this.id)
            .then(res => {})
            .catch(err => {
                console.error(err);
            })
    }

    static createConnectionForm(data = {}) {
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
    }

}