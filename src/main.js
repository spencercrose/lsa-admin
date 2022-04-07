/**
 * Long Service Awards: Admin Management Application
 * Developer: Spencer Rose (BCGov, PSA/PSECI)
 * Version: 1.0.0
 * Module: main.js
 *
 * **/

import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import VueRouter from 'vue-router'
import routes from './routes'
import storeConfig from './services/store.services'
import { BootstrapVue } from 'bootstrap-vue'
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css'
import {setTitle} from './services/router.services'

Vue.use(BootstrapVue)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.config.productionTip = false

const router = new VueRouter({
  base: '/admin',
  mode: 'history',
  routes: routes,
})

// define data store
const store = new Vuex.Store(storeConfig)

// This callback runs before every route change, including on page load.
router.beforeEach(setTitle)

// instantiate app
new Vue({
  store,
  el: '#app',
  router,
  render(h) { return h(App) }
})

