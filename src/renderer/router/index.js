import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'newTab',
            component: require('@/NewTab').default
        },
        {
            path: '/:tabId',
            name: 'quick-connection',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/FavoritesAside').default,
            },
            props: {
                default: { newFavorite: false }
            },
        },
        {
            path: '/:tabId/favorites',
            name: 'favorite',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/FavoritesAside').default,
            },
            props: {
                default: { newFavorite: true }
            },
        },
        {
            path: '/:tabId/favorites/:id',
            name: 'favorite-single',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/FavoritesAside').default,
            },
            props: {
                default: { newFavorite: false }
            },
        },
        {
            path: '/:tabId/connection/',
            name: 'tab',
            components: {
                default: require('@/components/Connection').default,
                aside: require('@/components/ConnectionAside').default,
            },
            children: [
                {
                    path: 'log',
                    components: {
                        default: require('@/components/Log').default,
                    }
                },
                {
                    path: 'query',
                    components: {
                        default: require('@/components/Query').default,
                    }
                },
                {
                    path: 'table',
                    components: {
                        default: require('@/components/TableContent').default,
                    }
                },
                {
                    path: 'structure',
                    meta: {supportNewTable: true},
                    components: {
                        default: require('@/components/TableStructure').default,
                    }
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});

export default router;
