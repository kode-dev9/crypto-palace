require('jquery')
import Vue from 'vue/dist/vue';
const axios = require('axios')
window.axios = axios
window.Vue = Vue
import BootstrapVue from 'bootstrap-vue'


Vue.use(BootstrapVue);

require('./components/auth')

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

new Vue({
  el: '#app-root'
});
