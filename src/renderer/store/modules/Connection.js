import find from 'lodash/find';
import Service from '../../Service';
import {CONNECT, GET_ALL_FAVORITES, SAVE_FAVORITE} from "../../../utils/main-events";

const state = {
    current: null,
    collection: []
};

const mutations = {
    SELECT(state, id) {
        state.current = find(state.collection, {id});
    },

    UNSELECT(state) {
        state.current = null;
    },

    ADD_UPDATE_COLLECTION(state, form) {
        let exists;

        if(! form.id) {
            throw new Error("Cannot add or update favorite with no id");
        }

        exists = find(state.collection, {id: form.id});

        if(exists) {
            for (let key of Object.keys(form)) {
                exists[key] = form[key];
            }
        } else {
            state.collection.push(Object.assign(form, {}));
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

    connect({ commit }, connectionForm) {
        return new Promise((resolve, reject) => {
            Service.send(CONNECT, connectionForm)
                .then(connectionData => {
                    commit('ADD_UPDATE_COLLECTION', connectionData);
                    resolve(connectionData);
                })
                .catch(err => reject(err))
        });
    }

};

export default {
    state,
    mutations,
    getters,
    actions
}
