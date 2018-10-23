import find from 'lodash/find';
import filter from 'lodash/filter';
import Tab from '../../Tab';
import Vue from 'vue';

const state = {
    current: null,
    collection: []
};

const mutations = {
    SET(state, id) {
        if(state.current) {
            state.current.deactivate();
        }

        if(id instanceof Tab) {
            state.current = id;
        } else {
            state.current = find(state.collection, {id});
        }

        state.current && state.current.activate();
    },

    UNSET(state) {
        if(state.current) {
            state.current.deactivate();
        }

        state.current = null;
    },

    ADD(state, tab) {
        let exists;

        if(tab.id) {
            exists = find(state.collection, {id: tab.id});
        }

        if(exists) {
            for (let key of Object.keys(tab)) {
                Vue.set(exists, key, tab[key]);
            }
        } else {
            state.collection.push(tab);
        }
    },

    REMOVE(state, tab) {
        state.collection.splice(state.collection.indexOf(tab), 1);
    }

};

const getters = {
    getTabById: (state) => (id) => {
        if(! id) {
            return null;
        }

        return find(state.collection, {id});
    },

    allTabs(state) {
        return state.collection;
    },

    tabsCount(state) {
        return state.collection.length;
    },

    currentTab(state) {
        return state.current;
    }
};

const actions = {

    async create({ commit, state }, data) {
        const tab = await Tab.create();

        commit('ADD', tab);

        return tab;
    },

    remove({ commit, state }, tab) {
        commit('REMOVE', tab);
        tab.close();
    }

};

export default {
    state,
    mutations,
    getters,
    actions
}
