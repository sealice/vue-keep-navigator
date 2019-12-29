import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueKeepNavigator from '../../src/index';

Vue.config.productionTip = false;

Vue.use(VueKeepNavigator, { router, mode: 'cache' });

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
