/*!
 * Authentication services (Vue)
 * File: auth.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

import axios from "axios";
import {asyncWrapper, handleResult} from './api.services'
import errorHandler from './error.services'

// set axios default headers
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

// configure Authentication connection
const auth = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? "https://lsaapp.gww.gov.bc.ca/"
    : "http://localhost/",
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    "Content-Type": "application/json",
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN' : 'XSRF-TOKEN'
  },
  withCredentials: true,
});
const proxyURL = "https://lsaapp.gww.gov.bc.ca"




/**
 * Authenticate user SAML credentials
 */

const authenticate = async () => {

  // call SAML API - user data endpoint
  let response = await axios.get(`${proxyURL}/user_info`, {});
  console.log('SAML Auth:', response)
  const {data = {}} = response || {};
  const { SMGOV_GUID=[null], username=[null] } = data || {};

  // test that tokens exist
  if ( !data || !SMGOV_GUID[0] || !username[0] )
    throw new Error()

  // reformat guest user data
  return {
    guid: SMGOV_GUID[0],
    username: username[0],
    role: 'visitor'
  }
}

/**
 * Get user authentication token
 */

const getAuthToken = async () => {
  const [error, result] = await asyncWrapper(auth.get('sanctum/csrf-cookie'))
  if (error) console.error(error)
  return [error, result]
}

/**
 * Get admin users list data
 */

const getUsers = async () => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(auth.get(`users`))
  return handleResult(error, result)
}

/**
 * Get user by ID
 */

const getUser = async (id) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(auth.get(`users/${id}`))
  return handleResult(error, result)
}

/**
 * Register admin user
 */

const registerUser = async (data) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(auth.post('register', data))
  return handleResult(error, result)

}

/**
 * Update recipient record
 */

const updateUser = async (id, userData) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(auth.put(`users/update/${id}`, userData))
  return handleResult(error, result)
}

/**
 * Sign in admin user
 */

const loginUser = async (data) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  if (!tokenError) {
    const [error, ] = await asyncWrapper(auth.post('login', data))
    if (error) {
      return [errorHandler.get('loginError'), null]
    }
    // successfully logged in
    const [profileError, profile] = await getProfile()
    return [profileError ? errorHandler.get('loginError') : null, profile]
  }
  else {
    return [tokenError, null]
  }
}

/**
 * Sign in admin user
 */

const logoutUser = async () => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  if (!tokenError) {
    const [error, ] = await asyncWrapper(auth.post('logout'))
    if (error) {
      return [errorHandler.get('serverError'), null]
    }
    // successfully logged out
    return [error, null]
  }
  else {
    return [tokenError, null]
  }
}

/**
 * Check if user is authenticated
 */

const isAuth = async () => {
  const [error, result] = await asyncWrapper(auth.get('isauth'))
  if (error) console.error(error)
  return [error, result]
}

/**
 * Get current user profile data
 */

const getProfile = async () => {
  const [error, result] = await asyncWrapper(auth.get('profile'))
  if (error) return [error, null]

  // extract role and organizations from response data
  const {data=null} = result || {}
  const {organizations=[], roles=[], name='', idir='', guid='', email=''} = data || {}

  if (!email) return [errorHandler.get('notAuthenticated'), null]

  // return user profile data
  return [error, {
    name: name,
    idir: idir,
    guid: guid,
    email: email,
    role: roles.length > 0 ? roles[0].name : '',
    organizations: organizations.map(org => {return org.id})
  }]
}

export {
  authenticate,
  getAuthToken,
  registerUser,
  updateUser,
  loginUser,
  logoutUser,
  isAuth,
  getProfile,
  getUsers,
  getUser
};
