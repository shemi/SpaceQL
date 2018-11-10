import Vue from 'vue';
import axios from 'axios';
import moment from 'moment';
import 'moment-precise-range-plugin';
import Element from 'element-ui';

import App from './App';
import router from './router';
import store from './store';

import locale from 'element-ui/lib/locale/lang/en';

import "./scss/app.scss";

import VueResize from 'vue-resize';

import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import VCode from './directives/code';

if (!process.env.IS_WEB) {
    Vue.use({
        install: function (Vue) {
            const electron = require('electron');

            Vue.prototype.$electron = electron;
            Vue.prototype.$windowId = electron.remote.getCurrentWindow().id;
        }
    });
}

Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(Element, {locale});
Vue.use(VueResize);
Vue.use(VueVirtualScroller);
Vue.use(VCode);

router.beforeEach((to, from, next) => {
    const tabId = to.params.tabId ? parseInt(to.params.tabId) : null;
    const tab = store.getters['Tabs/getTabById'](tabId);

    if(to.name !== 'newTab' && ! tab) {
        router.replace('/');

        return;
    }

    if(tab) {
        tab.setRoute(to.path);
        store.commit('Tabs/SET', tabId);
    }

    next();
});

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app');
