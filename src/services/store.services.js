/*!
 * Store services (Vue)
 * File: store.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

import {getAwards, getOptions, isHistoricalRecipient } from './api.services';
import optionServices from './options.services'

/**
 * Store initialization
 */

const initOptions = {
  organizations: [],
  pecsf: {
    charities: [],
    regions: []
  },
  ceremonies: []
}
const initUser = null
const initAwards = []

const initValidation = {}

const initMessage = {
  text: '',
  type: '',
  spinner: false
}


/**
 * State storage
 */


const state = {
  message: initMessage,
  error: false,
  loading: false,
  user: initUser,
  options: initOptions,
  awards: initAwards,
  metadata: {},
  form: null,
  pagination: {},
  validation: initValidation,
};



/**
 * State getters
 */


const getters = {

  getUser: state => {
    return state.user
  },
  isAuthenticated: state => {
    return !!state.user && !!state.user.role && !!state.user.email
  },
  isOrgContact: state => {
    return state.user.role === 'orgContact' || state.user.role === 'admin' || state.user.role === 'super-admin'
  },
  isAdmin: state => {
    return state.user.role === 'admin' || state.user.role === 'super-admin'
  },
  isSuperAdmin: state => {
    return state.user.role === 'super-admin'
  },
  getMessage: state => {
    return state.message || initMessage
  },
  isLoading: state => {
    return state.loading
  },
  getError: state => {
    return state.error
  },
  getFormData: state => {
    return state.form
  },
  getPagination: state => {
    return state.pagination
  },
  isValid: state => {
    // console.log(state.validation)
    return Object.keys(state.validation).filter(key => {
      return !state.validation[key]
    }).length === 0;
  },


  /**
   * Get ministries in store as select options
   *
   * @param  state
   * @return {Array}
   */

  getOrganizations: state => {
    return optionServices.getOrganizations(state.options.organizations)
  },

  /**
   * Get awards loaded for given milestone
   *
   * @param  state
   * @return {Array}
   */

  getAwards: state => {
    return state.awards
  },

  /**
   * Get PECSF charities and regions
   *
   * @param  state
   * @return {Object}
   */

  getPecsfOptions: state => {
    return optionServices.getPecsfOptions(state.options.pecsf)
  },

  /**
   * Get BC communities in store as select options
   *
   * @param  state
   * @return {Array}
   */

  getCommunities: state => {
    return optionServices.getCommunities(state.options.communities)
  },

  /**
   * Get ceremonies in store as select options
   *
   * @param  state
   * @return {Array}
   */

  getCeremonies: state => {
    return optionServices.getCeremonies(state.options.ceremonies)
  },
}


/**
 * Actions
 */


const actions = {


  /**
   * Load options in store
   * @param commit
   * @param data
   */

  async loadOptions({ commit }) {
    const options = await getOptions()
    commit("setOptions", options);
  },

  /**
   * Handle global error
   * @param commit
   * @param message
   */

  handleError ({ commit }, message) {
    commit('setMessage', message)
    commit('setError', message)
  },

  /**
   * Set global message
   * @param commit
   * @param msgData
   */

  setMessage({ commit }, msgData) {
    const { text='', type='', spinner=false, dismissible=false } = msgData || {}
    commit("setMessage", {
      text: text,
      type: type,
      spinner: spinner,
      dismissible: dismissible
    });
  },

  /**
   * Reset global message
   * @param commit
   */

  resetMessage({ commit }) {
    commit("resetMessage");
  },

  /**
   * Update registration workflow status
   * @param commit
   * @param regData
   */

  setStatus({ commit }, regData) {
    const { current=null, next=null, previous=null } = regData || {}
    commit("setStatus", {
      current: current,
      previous: previous,
      next: next
    });
  },

  /**
   * Reset registration data in store to initial values
   * @param commit
   * @param data
   */

  resetRegistration({ commit }) {
    commit("resetRegistration");
  },

  /**
   * Load awards for requested milestone
   * @param commit
   * @param milestone
   */

  async loadAwards({ commit }, milestone) {

    commit('setError', false)
    commit('setMessage', {
      text: `Loading Awards for milestone year ${milestone}...`,
      type: 'info',
      spinner: true
    })

    // retrieve awards data for milestone
    const [error, awards] = await getAwards(milestone)

    // do awards exist?
    if ( error || !awards ) {
      commit('setMessage', {
        text: 'Awards could not be found for this milestone.',
        type: 'danger'
      })
      commit('setError', true)
    }
    else {
      // reset awards in state
      commit("resetAwards")
      // set new awards in state
      commit("setAwards", awards || [])
      commit('resetMessage')
    }
  },

  /**
   * Check if current recipient is a historical recipient
   * @param commit
   * @param employee_number
   * @param milestone
   */

  async isHistoricalRecipient({commit}, employee_number) {
    commit('setMessage', { text: 'Looking up Employee Number...',  type:'info' })
    const [, result] = await isHistoricalRecipient(employee_number)
    commit('setFormData', { historical: result })
    commit('resetMessage')
  }

};


/**
 * State mutations
 */


const mutations = {
  setMessage( state, message ) {
    state.message = message
  },
  resetMessage (state) {
    state.message = initMessage
  },
  setError( state, isError ) {
    state.error = isError
  },
  setMetadata(state, data) {
    state.metadata = Object.assign({}, state.metadata, data)
  },
  resetAwards(state) {
    state.awards = []
  },
  setAwards(state, data) {
    state.awards = Object.assign([], state.awards, data)
  },
  setLoading( state, isLoading ) {
    state.loading = isLoading
  },
  setUser(state, user){
    if (user) {
      state.user = {
        role: user.role || '',
        idir: user.idir || '',
        name: user.name || '',
        email: user.email || '',
        organizations: user.organizations || []
      }
    }
    else state.user = null
  },
  setOptions(state, data) {
    state.options = data
  },
  setPecsfOptions(state, data) {
    state.options.pecsf = data
  },
  setFormData(state, data){
    state.form = Object.assign({}, state.form, data)
  },
  setFormValidation(state, data){
    state.validation = Object.assign({}, state.validation, data)
  },
  setPagination(state, data){
    state.pagination = Object.assign({}, state.pagination, data)
  },
};

export default {
  state,
  getters,
  actions,
  mutations
};
