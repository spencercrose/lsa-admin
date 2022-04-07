/*!
 * Routes (Vue)
 * File: routes.js
 * Copyright(c) 2022 BC Gov
 * MIT Licensed
 */

import Dashboard from './views/dashboard'
import NotFound from './views/404'
import DefaultList from "./views/default/list"
import Unauthorized from './views/401'
import UsersLogin from "./views/users/login"
import UsersList from "./views/users/list"
import UsersEdit from "./views/users/edit"
import UsersView from "./views/users/view"
import RecipientsList from "./views/recipients/list"
import RecipientsView from "./views/recipients/view"
import RecipientsEdit from "./views/recipients/edit"
import RecipientsDelete from "./views/recipients/delete"
import ReportsList from "./views/reports/list"
import ReportsView from "./views/reports/view"
import AwardsEdit from "./views/awards/edit"
import CeremoniesEdit from "./views/ceremonies/edit"

import {authorizeAdmin} from './services/router.services'


/**
 * Set page title/metadata by route
 *
 * @src public
 * @param title
 */

function getMeta(title) {
  const sitename = 'Long Service Awards Administration\n';
  return {
    title: `${title} - ${sitename}`,
    metaTags: [
      {
        name: 'icon',
        content: 'favicon.ico'
      },
    ]
  }
}

/**
 * Route definitions (Vue)
 *
 * @src public
 */

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: getMeta('Admin Dashboard'),
    beforeEnter: authorizeAdmin
  },
  {
    path: "/login",
    name: "users-login",
    component: UsersLogin,
    meta: getMeta('Sign In')
  },
  {
    path: "/users/register",
    name: "users-register",
    component: UsersEdit,
    meta: getMeta('Register Admin User'),
    props: {
      header: 'Register Admin User',
      lead: 'Create New Admin User',
      mode: 'create'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/users/edit/:id",
    name: "users-edit",
    component: UsersEdit,
    meta: getMeta('Edit User Profile'),
    props: {
      header: 'Edit User Info',
      lead: 'Edit Admin User Profile',
      mode: 'edit'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/users/view/:id",
    name: "users-view",
    component: UsersView,
    meta: getMeta('View User Info'),
    props: {
      header: 'View User Info',
      lead: 'View admin user record',
      mode: 'list'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/users",
    name: "users-list",
    component: UsersList,
    meta: getMeta('Manage Users'),
    props: {
      header: 'Manage Users',
      lead: 'Manage LSA admin users',
      mode: 'list'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/recipients",
    name: "recipients-list",
    component: RecipientsList,
    meta: getMeta('Manage Recipients'),
    props: {
      header: 'Manage Recipients',
      lead: 'Manage LSA recipient records',
      mode: 'list'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/recipients/view/:id",
    name: "recipients-view",
    component: RecipientsView,
    meta: getMeta('View Recipient'),
    props: {
      header: 'View Recipient',
      lead: 'View LSA recipient record',
      mode: 'view'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/recipients/create",
    name: "recipients-add",
    component: RecipientsEdit,
    meta: getMeta('Add Recipient'),
    props: {
      header: 'Add Recipient',
      lead: 'Add new LSA recipient record',
      mode: 'create'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/recipients/edit/:id",
    name: "recipients-edit",
    component: RecipientsEdit,
    meta: getMeta('Edit Recipient'),
    props: {
      header: 'Edit Recipient',
      lead: 'Edit LSA recipient record',
      mode: 'edit'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/recipients/delete/:id",
    name: "recipients-delete",
    component: RecipientsDelete,
    meta: getMeta('Delete Recipient'),
    props: {
      header: 'Delete Recipient',
      lead: 'Delete LSA recipient record',
      mode: 'delete'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/reports",
    name: "reports-list",
    component: ReportsList,
    meta: getMeta('Reports'),
    props: {
      header: 'Reports',
      lead: 'Manage and generate LSA reports',
      mode: 'list'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/reports/view/:id",
    name: "reports-view",
    component: ReportsView,
    meta: getMeta('Report'),
    props: {
      header: 'Report',
      lead: 'View report data',
      mode: 'list'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/awards",
    name: "awards-list",
    component: DefaultList,
    meta: getMeta('Manage Awards'),
    props: {
      header: 'Manage Awards',
      lead: 'List of LSA awards',
      mode: 'list',
      model: 'awards',
      single: 'Award'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/awards/edit/:id",
    name: "awards-edit",
    component: AwardsEdit,
    meta: getMeta('Edit Award'),
    props: {
      header: 'Update Award',
      lead: 'Update LSA award details',
      mode: 'create'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/awards/create",
    name: "awards-add",
    component: AwardsEdit,
    meta: getMeta('Add Award'),
    props: {
      header: 'Add Award',
      lead: 'Add new LSA award record',
      mode: 'create'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/ceremonies",
    name: "ceremonies-list",
    component: DefaultList,
    meta: getMeta('Manage Ceremonies'),
    props: {
      header: 'Manage Ceremonies',
      lead: 'List of upcoming LSA ceremonies',
      mode: 'list',
      model: 'ceremonies',
      single: 'Ceremony'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/ceremonies/create",
    name: "ceremonies-add",
    component: CeremoniesEdit,
    meta: getMeta('Add Ceremony'),
    props: {
      header: 'Add Ceremony',
      lead: 'Add new LSA ceremony record',
      mode: 'create'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: "/ceremonies/edit/:id",
    name: "ceremonies-edit",
    component: CeremoniesEdit,
    meta: getMeta('Edit Ceremony'),
    props: {
      header: 'Edit Ceremony',
      lead: 'Edit LSA ceremony record',
      mode: 'edit'
    },
    beforeEnter: authorizeAdmin
  },
  {
    path: '/401',
    name: 'unauthorized',
    component: Unauthorized,
    meta: getMeta('Unauthorized')
  },
  {
    path: '*',
    name: "page-not-found",
    component: NotFound ,
    meta: getMeta('Page Not Found')
  }
];

export default routes;
