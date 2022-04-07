/*!
 * Form validation services/utilities (Vue)
 * File: validation.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

export {
  genID,
  validateText,
  validateEmail,
  validatePassword,
  validatePostcode,
  validatePhone,
  validateAwardOptions
};

/**
 * Generate random ID string
 *
 * **/

function genID() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for ( let i = 0; i < chars.length; i++ ) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Validates input text
 * **/

const validateText = (str) => {
  return !!String(str || '')
};

/**
 * Validates email address
 * Reference: https://stackoverflow.com/a/46181 (Retrieved Jan 18, 2022)
 * **/

const validateEmail = (email) => {
  return !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/**
 * Validates email address
 * Reference: https://stackoverflow.com/a/46181 (Retrieved Jan 18, 2022)
 * **/

const validatePassword = (password) => {
  return !!String(password)
};

/**
 * Validates Canadian phone number
 * Reference: https://stackoverflow.com/a/29767609 (Retrieved Jan 25, 2022)
 * Valid formats:
 (123) 456-7890
 (123)456-7890
 123-456-7890
 123.456.7890
 1234567890
 +31636363634
 075-63546725
 * **/

const validatePhone = (phone) => {
  return !!String(phone)
    .toLowerCase()
    .match(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/im
    );
};

/**
 * Validates Canadian postal code
 * Reference: https://stackoverflow.com/a/46761018
 * ### ###
 * **/

const validatePostcode = (postalcode) => {
  return !!String(postalcode)
    .toLowerCase()
    .match(
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i
    );
};


/**
 * Validate award options
 * **/

const validateAwardOptions = (type, field, awardSelection) => {

  // destructure award option selections
  const {id=null, options=null} = awardSelection || {}
  const {selections=[]} = options || {}
  if (!parseInt(id)) return false

  // validate PECSF options
  if (type === 'pecsf') {
    let selected = {
      pecsfPool: true,
      pecsfRegion1: null,
      pecsfCharity1: null,
      pecsfRegion2: null,
      pecsfCharity2: null,
      honour: null,
      certificate: null
    }
    // convert array of options to indexed object
    selections.forEach(option => {
      selected[option.key] = option.value
    })
    const fields = {
      pecsfRegion1: () => {
        return !!selected.pecsfRegion1
      },
      pecsfCharity1: () => {
        return !!selected.pecsfPool || !!selected.pecsfRegion1 && !!selected.pecsfCharity1
      },
      pecsfRegion2: () => {
        return true
      },
      pecsfCharity2: () => {
        return !!selected.pecsfPool
          || (!selected.pecsfPool && !selected.pecsfRegion2)
          || (!!selected.pecsfRegion2 && !!selected.pecsfCharity2)
      },
      honour: () => {
        return !!selected.honour
      },
      certificate: () => {
        // validate certificate
        return selections.filter(opt => {
          return String(opt.key) === 'certificate' && !opt.value
        }).length === 0
      }
    }
    if (fields[field] === 'undefined') return false;
    // check if all fields validate
    if (field === 'all') return Object.keys(fields).filter(key => {
      return !fields[key]()
    }).length === 0;
    return !!fields[field]();
  }
  if (type === 'watch') {
    // test that all option values (except engravings) have been selected
    return selections.length > 0 && selections.filter(selection => {
      return !selection.value && selection.key !== 'engraving'
    }).length === 0
  }
  else {
    // test that all option values have been selected
    return selections.length > 0 && selections.filter(selection => {
      return !selection.value
    }).length === 0
  }
};
