window.$ = require('jquery/dist/jquery.js')
window.jQuery = $
require('./vendors/index')
require('./core')
require('./scripts/index')

import Vue from 'vue/dist/vue';
const axios = require('axios')
window.axios = axios
window.Vue = Vue

import 'bootstrap/dist/css/bootstrap.css'
import '../sass/style.scss'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'


Vue.use(BootstrapVue);
var io = require('socket.io-client/dist/socket.io.js')
var socket = io.connect('http://localhost:3000');

require('./components/auth')
require('./components/backend')


new Vue({
  el: '#app-root'
});

//require('./vendors/index')
//require('./scripts/index')
//require('./core')