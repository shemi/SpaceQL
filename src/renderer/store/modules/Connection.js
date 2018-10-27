import find from 'lodash/find';
import Service from '../../Service';
import {CONNECT, GET_ALL_FAVORITES, SAVE_FAVORITE} from "../../../utils/main-events";
import Connection from '../../Connection';

const state = {
    current: null,
    collection: []
};

const mutations = {
    SELECT(state, id) {
        if(id instanceof Connection) {
            state.current = id;
        } else {
            state.current = find(state.collection, {id});
        }
    },

    UNSELECT(state) {
        state.current = null;
    },

    ADD_UPDATE_COLLECTION(state, connection) {
        let exists;

        if(! connection.id) {
            throw new Error("Cannot add or update connection with no id");
        }

        exists = find(state.collection, {id: connection.id});

        if(exists) {
            for (let key of Object.keys(connection)) {
                exists[key] = connection[key];
            }
        } else {
            state.collection.push(connection);
        }
    },

    PUSH_TO_COLLECTION(state, connectionData) {
        state.collection.push(connectionData);
    }
};

const getters = {
    getConnectionById: (state) => (id) => {
        return find(state.collection, {id});
    },

    allConnections(state) {
        return state.collection;
    },

    currentConnection(state) {
        return state.current;
    }
};

const actions = {

};

export default {
    state,
    mutations,
    getters,
    actions
}
