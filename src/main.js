import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App.vue';
import store from './store';
import router from './routes/router';

Vue.use(DashboardPlugin);

/* eslint-disable no-new */
window.app = new Vue({
  el: '#app',
  store: store,
  beforeCreate() { 
    this.$store.commit('wallet/initialiseStore');
  },
  render: h => h(App),
  router
});
