/*!
 * API services (Vue)
 * File: api.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

import axios from "axios";
import errorHandler from "./error.services";
import {getAuthToken} from "./auth.services";
import { saveAs } from 'file-saver';


// set axios default headers
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

const baseURL = process.env.NODE_ENV === 'production'
  ? "https://lsaapp.gww.gov.bc.ca/api"
  : "http://localhost/api";

// configure Authentication connection
const api = axios.create({
  baseURL: baseURL,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    "Content-Type": "application/json",
    'X-Requested-With': 'XMLHttpRequest',
    'X-XSRF-TOKEN' : 'XSRF-TOKEN'
  },
  withCredentials: true,
});
// const proxyURL = "https://lsaapp.gww.gov.bc.ca"


/**
 * Helper utility for removing async/await try/catch litter
 * - encapsulates API errors to avoid cascading fallbacks
 */

/* Native Error types https://mzl.la/2Veh3TR */

const nativeExceptions = [
  EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError
].filter((except) => typeof except === 'function')

/* Throw native errors. ref: https://bit.ly/2VsoCGE */
function throwNative(error) {
  for (const Exception of nativeExceptions) {
    if (error instanceof Exception) throw error
  }
}

function asyncWrapper(promise, finallyFunc) {
  return promise.then(data => {
    if (data instanceof Error) {
      throwNative(data)
      return [ data ]
    }
    return [ undefined, data ]
  }).catch(error => {
    throwNative(error)
    return [ error ]
  }).finally(() => {
    if (finallyFunc && typeof finallyFunc === 'function') {
      finallyFunc()
    }
  })
}

/**
 * Process API result
 */

const handleResult = (error, result) => {
  const {data=null} = result || {}
  if (error && error.response) {
    if (error.response.status === 403 || error.response.status === 401) {
      return [errorHandler.get('notAuthorized'), null]
    }
    else if (error.response.status === 422) {
      return [errorHandler.get('invalidData'), null]
    }
    else return [errorHandler.get('serverError'), null]
  }
  return [error, data]
}


/**
 * Check for historical recipient registration
 */

const isHistoricalRecipient = async (employeeNumber) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]
  const [error, result] = await asyncWrapper(api.get(`/recipients/archived/${employeeNumber}`))
  return handleResult(error, result)
}

/**
 * Check for pre-existing recipient registration by Employee Number
 */

const hasRegistered = async (employeeNumber) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]
  const [error, result] = await asyncWrapper(api.get(`/recipients/employee_number/${employeeNumber}`))
  return handleResult(error, result)

}

/**
 * Get recipients list data
 */

const getRecipients = async (pageNum='', filters=[]) => {
  let pageURL = pageNum ? `recipients/list?page=${pageNum}` : `recipients/list`
  let filterQuery = ''

  // apply any filters
  filters.forEach(filter => {
    filterQuery = filterQuery || pageNum
      ? `${filterQuery}&${filter.key}=${filter.value}`
      : `?${filter.key}=${filter.value}`
  })
  pageURL = `${pageURL}${filterQuery}`

  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]
  const [error, result] = await asyncWrapper(api.get(pageURL))
  return handleResult(error, result)
}

/**
 * Get recipient by ID
 */

const getRecipient = async (id) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(api.get(`recipients/view/${id}`))
  const {data=null} = result || {}

  // filter recipient awards by selected milestone
  const {
    awards=[],
    milestones='',
    supervisor_address=null,
    office_address=null,
    personal_address=null
  } = data || {}
  const selectedAwards = awards.filter(item =>
    String(item.milestone) === String(milestones)
  )
  let selectedAward = { award_id: null, award_name: null, options: {} }
  // award selection found
  // - store ID, name and options, status
  if (selectedAwards.length > 0) {
    const { pivot={} } = selectedAwards[0] || {}
    const { award_id=null, options='{}', name=null, status='' } = pivot || {}
    selectedAward = {
      id: award_id,
      name: name,
      options: JSON.parse(options),
      status: status
    }
  }
  let filteredData = Object.assign({}, data, {award: selectedAward})
  // fill in missing address objects
  if (!office_address) {
    filteredData = Object.assign({}, filteredData, {
      office_address: {
        id: null,
        prefix: '',
        street_address: '',
        postal_code: null,
        community: ''
      }
    })
  }
  if (!personal_address) {
    filteredData = Object.assign({}, filteredData, {
      personal_address: {
        id: null,
        prefix: '',
        street_address: '',
        postal_code: null,
        community: ''
      }
    })
  }
  if (!supervisor_address) {
    filteredData = Object.assign({}, filteredData, {
      supervisor_address: {
        id: null,
        pobox: '',
        prefix: '',
        street_address: '',
        postal_code: null,
        community: ''
      }
    })
  }
  return handleResult(error, {data: filteredData || {}})
}

/**
 * Create new recipient record
 */

const createRecipient = async (recipientData) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  // encode award data JSON
  const award = {
    id: recipientData.award.id || null,
    options: JSON.stringify(recipientData.award.options) || JSON.stringify({}),
    status: 'delegated'
  }
  const filteredData = Object.assign({}, recipientData, {award: award})

  const [error, result] = await asyncWrapper(
    api.post(`recipients/create`, filteredData)
  )
  return handleResult(error, result)

}

/**
 * Update recipient record
 */

const updateRecipient = async (id, recipientData) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]
  // encode award data JSON
  const award = {
    id: recipientData.award.id || null,
    options: JSON.stringify(recipientData.award.options) || JSON.stringify({}),
    status: 'delegated'
  }
  const filteredData = Object.assign({}, recipientData, {award: award})
  const [error, result] = await asyncWrapper(
    api.put(`recipients/update/${id}`, filteredData)
  )
  return handleResult(error, result)
}

/**
 * Delete (disable) recipient record
 */

const deleteRecipient = async (id) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(
    api.get(`recipients/delete/${id}`)
  )
  return handleResult(error, result)
}

/**
 * Get awards for requested milestone
 *
 * @param milestone
 */

const getAwards = async (milestone) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(api.get(`milestones/${milestone}/awards`))
  const [processedError, data] = handleResult(error, result)

  return [processedError, (data || []).map(award => {
    return {
      id: award.id || '',
      name: award.name || '',
      shortName: award.short_name || '',
      description: award.description || '',
      imageUrl: award.image_url || '',
      options: JSON.parse(award.options) || null,
    }
  })]
}

/**
 * Get static options:
 * - ministries
 * - BC communities
 * - PECSF regions
 * - PECSF charities
 */

const getOptions = async () => {
  const organizationOptions = await api.get(`organizations`)
  const communityOptions = await api.get(`communities`)
  const pecsfCharityOptions = await api.get(`pecsf/charities`)
  const pecsfRegionOptions = await api.get(`pecsf/regions`)
  const ceremonies = await api.get('ceremonies/list')
  return {
    organizations: (organizationOptions.data || []).map(org => {
      return {
        id: org.id || '',
        name: org.name || '',
        shortName: org.short_name || '',
        orgType: org.org_type || ''
      }
    }),
    communities: (communityOptions.data || []).map(community => {
      return {
        id: community.id || '',
        name: community.name || '',
        region: community.region || ''
      }
    }),
    pecsf: {
      charities: pecsfCharityOptions ? pecsfCharityOptions.data : [],
      regions: pecsfRegionOptions ? pecsfRegionOptions.data : []
    },
    ceremonies: ceremonies ? ceremonies.data : []
  }
}

/**
 * Get item data
 */

const get = async (url) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(api.get(url))
  return handleResult(error, result)
}

/**
 * Put item data
 */

const put = async (url, formData) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(api.put(url, formData))
  return handleResult(error, result)
}

/**
 * Post item data
 */

const post = async (url, formData) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]

  const [error, result] = await asyncWrapper(api.post(url, formData))
  return handleResult(error, result)
}

/**
 * Download file
 */

const download = async (url, filename, format) => {
  const [tokenError,] = await getAuthToken()
  if (tokenError) return [errorHandler.get('invalidToken'), null]
  const [error, result] = format === 'pdf'
    ? await asyncWrapper(api.get(url, {responseType: 'blob'}))
    : await asyncWrapper(api.get(url, {responseType: 'blob'}))
  const [processedError, data] = handleResult(error, result)

  if (error) return [processedError, null]

  const res = saveAs(data, filename)
  return [processedError, res]
}

export {
  asyncWrapper,
  handleResult,
  isHistoricalRecipient,
  hasRegistered,
  getRecipients,
  getRecipient,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  get,
  put,
  post,
  download,
  getAwards,
  getOptions
};
