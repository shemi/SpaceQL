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
            }
        },
        {
            path: '/favorites',
            name: 'new-favorite',
            components: {
                default: require('@/components/ConnectionForm').default,
                aside: require('@/components/ConnectionAside').default,
            },
            props: {
                aside: { newFavorite: true }
            },
            children: [
                {
                    path: ':id',
                    favorites: 'single-favorite',
                    props: {
                        aside: { newFavorite: false }
                    },
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})
