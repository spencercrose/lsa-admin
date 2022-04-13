/*!
 * Form services/utilities (Vue)
 * File: forms.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

const schemaData = {
  "status": [
    {value: '', text: 'Select a registration status'},
    {value: 0, text: 'Draft'},
    {value: 1, text: 'Submitted'}
  ],
  "roles": [
    {value: '', text: 'Select a user role'},
    {value: 'super-admin', text: 'Super-Administrator'},
    {value: 'admin', text: 'Administrator'},
    {value: 'orgContact', text: 'Organization Contact'}
  ],
  "recipientActions": [
    {value: '', text: 'Select an action'},
    {value: 'assign', text: 'Assign to Ceremony'},
    {value: 'waitlist', text: 'Waitlist for Ceremony'}
  ],
  "isHistorical": [
    {value: '', text: 'Select historical status'},
    {value: 1, text: 'Historical Recipient'},
    {value: 0, text: 'Non-Historical Recipient'}
  ],
  "isRetiring": [
    {value: '', text: 'Select a retirement status'},
    {value: 1, text: 'Retiring This Year'},
    {value: 0, text: 'Not Retiring This Year'}
  ],
  "ceremony-opt-out": [
    {value: '', text: 'Select ceremony opt-out status'},
    {value: 1, text: 'Has opted out of attending ceremony'},
    {value: 0, text: 'Has not opted out of attending ceremony'}
  ],
  "milestones": [
    {value: '', text: 'Select a milestone year'},
    {value: '25', text: '25 Years'},
    {value: '30', text: '30 Years'},
    {value: '35', text: '35 Years'},
    {value: '40', text: '40 Years'},
    {value: '45', text: '45 Years'},
    {value: '50', text: '50 Years'}
  ],
  "qualifying-years": [
    {value: '2022', text: '2022'},
    {value: '2021', text: '2021'},
    {value: '2020', text: '2020'},
    {value: '2019', text: '2019'}
  ],
  "award-types": [
    {value: 'pecsf', text: 'PECSF'},
    {value: 'watch', text: 'Watch'},
    {value: 'bracelet', text: 'Bracelet'},
  ],
  "award-option-types": [
    {value: 'sizes', text: 'Size', type:'select'},
    {value: 'faces', text: 'Watch Face', type:'select'},
    {value: 'straps', text: 'Watch Strap', type:'select'},
    {value: 'engraving', text: 'Engraving', type:'input'},
    {value: 'certificate', text: 'Name for the 25 Year Certificate', type:'input'},
    {value: 'pecsfPool', text: 'Donate to PECSF Regional Pool Fund', type:'boolean'},
    {value: 'pecsfRegion1', text: 'PECSF Region 1', type:'data'},
    {value: 'pecsfCharity1', text: 'PECSF Charity (Region 1)', type:'data'},
    {value: 'pecsfRegion2', text: 'PECSF Region 2', type:'data'},
    {value: 'pecsfCharity2', text: 'PECSF Charity (Region 2)', type:'data'},
    {value: 'honour', text: 'In Honour of', type:'input'},
  ],
  "sort-by": [
    {value: '', text: 'Select the sorting column'},
    {value: 'first_name', text: 'First Name'},
    {value: 'last_name', text: 'Last Name'},
    {value: 'employee_number', text: 'Employee Number'},
    {value: 'branch_name', text: 'Branch Name'},
    {value: 'milestones', text: 'Milestone'},
    {value: 'updated_at', text: 'Updated Date'},
    {value: 'created_at', text: 'Created Date'}
  ],
  "sort-order": [
    {value: '', text: 'Select the sorting order'},
    {value: 'asc', text: 'Ascending'},
    {value: 'desc', text: 'Descending'},
  ],
  "results-per-page": [
    {value: '', text: 'Select the number of results per page'},
    {value: 25, text: '25 records per page'},
    {value: 50, text: '50 records per page'},
    {value: 100, text: '100 records per page'},
    {value: 200, text: '200 records per page'},
  ],
  "awards": [
    {key: 'short_name', label: 'Code', sortable: true},
    {key: 'name', label: 'Name', sortable: true},
    {key: 'milestone', label: 'Milestone', sortable: true},
    {key: 'created_at', sortable: true},
    {key: 'updated_at', sortable: true},
    {key: 'details', label: '', sortable: false}
  ],
  "ceremonies": [
    {key: 'id', label: 'Ceremony', sortable: false},
    {key: 'scheduled_datetime', label: 'Scheduled Date', sortable: true},
    {key: 'created_at', sortable: true},
    {key: 'updated_at', sortable: true},
    {key: 'details', label: '', sortable: false}
  ]
};

export default {

  /**
   * get enumerated data by key
   * **/

  get: function get(key) {
    return schemaData[key] !== 'undefined' ? schemaData[key] : null;
  },

  /**
   * lookup enumerated option value by key
   * **/

  lookup: function lookup(key, value, options=schemaData) {
    if (!options[key]) return null;
    const found = options[key].filter(item => item.value === value);
    return found.length > 0 ? found[0].text : null;
  },

  /**
   * get award options for given award ID
   * **/

  getAwardOptions: function getAwardOptions(key, awards) {
    // find matching option
    const filteredAwards = (awards || [])
      .filter(award => {
        const { id=null } = award || {}
        return String(id) === String(key)
      })

    // map award options to selection options
    if (filteredAwards.length > 0) {
      const { options=null } = filteredAwards[0] || {}
      return options
        ? Object.keys(options || {}).map(optionKey => {
          return {
            key: optionKey,
            label: this.lookup('award-option-types', optionKey),
            options: Array.isArray(options[optionKey]) ? options[optionKey] : null,
            selected: null,
            disabled: false
          }
        })
        : null
    }
    else return null
  },

  /**
   * get award details by award ID
   * **/

  getAwardDetails: function getAwardDetails(id, awards) {
    const awardDetails = awards.filter(award => award.id === id)
    return awardDetails.length > 0 ? awardDetails[0] : null
  },

  /**
   * get organizations (ministries)
   * **/

  getOrganizations: function getOrganizations(data) {
    // sorting comparison function
    // - puts items in alphabetical order
    function compare( a, b ) {
      if ( a.shortName < b.shortName )return -1;
      if ( a.shortName > b.shortName )return 1;
      return 0;
    }
    const orgs = (data || [])
      .sort(compare)
      .map(org => {
        return {
          text: `${org.shortName} - ${org.name}`,
          value: org.id
        }
      }) || []
    orgs.unshift({ value: '', text: 'Select a Ministry' })
    return orgs
  },

  /**
   * get communities in British Columbia
   * **/

  getCommunities: function getCommunities(data) {
    // sorting comparison function
    // - puts items in alphabetical order
    function compare( a, b ) {
      if ( a.name < b.name )return -1;
      if ( a.name > b.name )return 1;
      return 0;
    }
    const communities = (data || [])
      .sort(compare)
      .map(community => {
        return {
          text: `${community.name}`,
          value: community.id
        }
      }) || []
    communities.unshift({ value: '', text: 'Select a Community' })
    return communities
  },

  /**
   * get PECSF options
   * **/

  getPecsfOptions: function getPecsfOptions(data) {

    const {regions = [], charities = [] } = data || {}

    // sorting comparison function
    // - puts items in alphabetical order
    function compare( a, b ) {
      if ( a.name < b.name )return -1;
      if ( a.name > b.name )return 1;
      return 0;
    }

    // map regions as select options
    const filteredRegions = regions
      .sort(compare)
      .map(org => {
        return {
          text: org.name,
          value: org.id
        }
      }) || []
    filteredRegions.unshift({ value: '', text: 'Select a PECSF region' })

    // map charities as select options
    const filteredCharities = charities
      .sort(compare)
      .map(org => {
        return {
          region: org.pecsf_region_id,
          text: org.name,
          value: org.id
        }
      }) || []
    filteredCharities.unshift({ value: '', text: 'Select a PECSF charity' })

    return {
      regions: filteredRegions,
      charities: filteredCharities
    }
  },

  /**
   * get ceremonies
   * **/

  getCeremonies: function getCeremonies(data) {
    const ceremonies = (data || [])
      .map(ceremony => {
        const scheduledDate = new Date(ceremony.scheduled_datetime)
        return {
          text: scheduledDate.toLocaleString(),
          value: ceremony.id
        }
      }) || []
    ceremonies.unshift({ value: '', text: 'Select a Ceremony' })
    return ceremonies
  },

  /**
   * reformat phone number
   * **/

  formatPhoneNumber: function formatPhoneNumber(str) {
    // Filter only numbers from the input
    let cleaned = ('' + str).replace(/\D/g, '');

    //Check if the input is of correct length
    let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }

    return null
  },

  /**
   * get the engraving character limit based on watch face size
   * - 15 characters for small face (29mm)
   * - 18 characters for large face (38mm)
   * **/

  getEngravingCharLimit: function getEngravingCharLimit(size) {
    return size === '38mm' ? 18 : 15
  }

}
