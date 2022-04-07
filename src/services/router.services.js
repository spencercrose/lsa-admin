/*!
 * Router hooks (Vue)
 * File: router.services.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

import store from '@/services/store.services'
export {setTitle, authenticate, authorizeAdmin, authorizeSuperAdmin};


/**
 * Rewrite page title and metadata (head)
 *
 * **/

const setTitle = (to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

  const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title;
  } else if (previousNearestWithMeta) {
    document.title = previousNearestWithMeta.meta.title;
  }

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode.removeChild(el));

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta) return next();

  // Turn the meta tag definitions into actual elements in the head.
  nearestWithMeta.meta.metaTags.map(tagDef => {
    const tag = document.createElement('meta');

    Object.keys(tagDef).forEach(key => {
      tag.setAttribute(key, tagDef[key]);
    });

    // We use this to track which meta tags we create so we don't interfere with other ones.
    tag.setAttribute('data-vue-router-controlled', '');

    return tag;
  })
    // Add the meta tags to the document head.
    .forEach(tag => document.head.appendChild(tag));

  next();
}

/**
 * Authenticate user based on existing credentials.
 *
 * @param to
 * @param from
 * @param next
 * @src public
 */

const authenticate = (to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  if (!isAuthenticated) next({ name: 'unauthorized' })
  else next()
}

/**
 * Authorize user based on existing credentials.
 *
 * @param to
 * @param from
 * @param next
 * @src public
 */

const authorizeAdmin = (to, from, next) => {
  const isAdmin = store.getters.isAdmin;
  if (!isAdmin) next({ name: 'unauthorized' })
  else next()
}

const authorizeSuperAdmin = (to, from, next) => {
  const isSuperAdmin = store.getters.isSuperAdmin;
  if (!isSuperAdmin) next({ name: 'unauthorized' })
  else next()
}
