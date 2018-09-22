import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'quick-connection',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/ConnectionAside').default,
            },
            props: {
                default: { newFavorite: false }
            },
        },
        {
            path: '/favorites',
            name: 'favorite',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/ConnectionAside').default,
            },
            props: {
                default: { newFavorite: true }
            },
        },
        {
            path: '/favorites/:id',
            name: 'favorite-single',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/ConnectionAside').default,
            },
            props: {
                default: { newFavorite: false }
            },
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
