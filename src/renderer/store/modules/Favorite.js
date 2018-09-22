import find from 'lodash/find';
import Service from '../../Service';
import {GET_ALL_FAVORITES, SAVE_FAVORITE} from "../../../utils/main-events";

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

    PUSH_TO_COLLECTION(state, favorite) {
        state.collection.push(favorite);
    }
};

const getters = {
    getFavoriteById: (state) => (id) => {
        return find(state.collection, {id});
    },

    allFavorites(state) {
        return state.collection;
    },
    currentFavorite(state) {
        return state.current;
    }
};

const actions = {
    loadFavorites({ commit }) {
        Service.send(GET_ALL_FAVORITES)
            .then(favorites => {
                console.log(favorites);
                for(let favorite of favorites) {
                    commit('PUSH_TO_COLLECTION', favorite);
                }
            })
    },

    saveFavorite({ commit }, form) {
        return new Promise((resolve, reject) => {
            Service.send(SAVE_FAVORITE, form)
                .then(favorite => {
                    commit('ADD_UPDATE_COLLECTION', favorite);
                    resolve(favorite);
                });
        });
    }

};

export default {
    state,
    mutations,
    getters,
    actions
}
