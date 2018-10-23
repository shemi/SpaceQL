import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import Service from '../../Service';

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

    DELETE(state, id) {
        let index = findIndex(state.collection, {id});

        if(index < 0) {
            return;
        }

        state.collection.splice(index, 1);
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
        Service.send('FavoritesController@all')
            .then(favorites => {

                for(let favorite of favorites) {
                    commit('ADD_UPDATE_COLLECTION', favorite);
                }
            })
    },

    saveFavorite({ commit }, form) {
        return new Promise((resolve, reject) => {
            Service.send('FavoritesController@createUpdate', form)
                .then(favorite => {
                    commit('ADD_UPDATE_COLLECTION', favorite);
                    resolve(favorite);
                });
        });
    },

    removeFavorite({ commit }, id) {
        console.log(id);

        commit('DELETE', id);

        return Service.send('FavoritesController@destroy', id);
    }

};

export default {
    state,
    mutations,
    getters,
    actions
}
