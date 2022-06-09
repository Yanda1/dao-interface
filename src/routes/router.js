import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import routes from './routes';

Vue.use(VueRouter);
Vue.use(VueMeta);

// configure router
const router = new VueRouter({
    routes, // short for routes: routes
    linkActiveClass: 'active',
    mode: 'history',
    hash: false,
    scrollBehavior: (to, from, savedPosition) => {
        if (savedPosition) {
            return savedPosition;
        }
        if (to.hash) {
            return { selector: to.hash };
        }
        return { x: 0, y: 0 };
    }
});

export default router;
