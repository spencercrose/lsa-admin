<template>
  <div style="z-index: 9990">
    <b-sidebar
      v-if="isAuthenticated"
      id="sidebar-profile"
      title="User Profile"
      backdrop-variant="dark"
      backdrop
      style="z-index: 9999"
      shadow>
      <Profile />
    </b-sidebar>

    <b-navbar fixed="top" toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="/admin">
        <span>Long Service Awards <b-badge variant="info">Admin</b-badge></span>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav type="dark" variant="info">
        <b-navbar-nav>
          <li>
            <router-link class="nav-link" to="/" exact>Home</router-link>
          </li>
          <b-nav-item href="https://longserviceawards.gww.gov.bc.ca/">About</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" v-if="isAuthenticated">
          <b-nav-item-dropdown v-if="user" right class="btn btn-info text-light p-0">
            <template #button-content>
              <BIconPerson /> {{user.idir || user.email.split('@')[0]}}
            </template>
            <b-dropdown-item v-b-toggle.sidebar-profile>
              Profile
            </b-dropdown-item>
            <b-dropdown-item v-if="isOrgContact">
              <a href="#" @click="reroute('/recipients/create')">Register Recipient</a>
            </b-dropdown-item>
            <b-dropdown-item v-if="isOrgContact">
              <a href="#" @click="reroute('/recipients/')">Manage Recipients</a>
            </b-dropdown-item>
            <b-dropdown-item v-if="isAdmin">
              <a href="#" @click="reroute('/awards/')">Manage Awards</a>
            </b-dropdown-item>
            <b-dropdown-item v-if="isAdmin">
              <a href="#" @click="reroute('/ceremonies/')">Manage Ceremonies</a>
            </b-dropdown-item>
            <b-dropdown-item v-if="isAdmin">
              <a href="#" @click="reroute('/reports/')">Reports</a>
            </b-dropdown-item>
            <b-dropdown-item v-if="isAdmin">
              <router-link to="/users/register">Add User</router-link>
            </b-dropdown-item>
            <b-dropdown-item v-if="isSuperAdmin">
              <a href="#" @click="reroute('/users/')">Manage Users</a>
            </b-dropdown-item>
            <b-dropdown-item>
              <b-button block type="button" @click="logout()">Sign Out</b-button>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" v-if="!atLoginPage && !isAuthenticated && !isLoading">
          <b-button variant="info" type="button" @click="reroute('/login')">Sign In</b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>
<script>

/**
 * Main navigation bar
 */

import Profile from './UserProfile'
import { BIconPerson } from 'bootstrap-vue'
import { getProfile, logoutUser } from "@/services/auth.services";

export default {
  name: "navbar",
  components: {
    Profile, BIconPerson
  },
  computed : {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    isOrgContact () {
      return this.$store.getters.isOrgContact
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isSuperAdmin () {
      return this.$store.getters.isSuperAdmin
    },
    isLoading () {
      return this.$store.getters.isLoading
    },
    atLoginPage() {
      return this.$route.name === 'users-login'
    },
    user () {
      return this.$store.getters.getUser
    }
  },
  methods: {
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async logout() {
      this.$store.commit('setMessage', {text: "Signing out...", type: "info"})
      const [error,] = await logoutUser()
      console.log(error)
      this.$store.commit('setMessage', error ? error : {text: "Signed Out Successfully", type: "success"}
      )
      if (!error) {
        this.$store.commit('setUser', null)
      }
      if (this.$route.name !== 'user-login') await this.reroute('/login')
    }
  },
  async beforeCreate() {
    this.$store.commit('setLoading', true)

    // set user in store
    const [error, user] = await getProfile()

    if (!error && user) {
      // store user data
      this.$store.commit('setUser', user)
      // load options

      this.$store.commit('setLoading', false)
    }
    else {
      this.$store.commit('setError', {
        text: "Server Error Occurred. Please contact the site administrator", type: "danger"
      })
      this.$store.commit('setLoading', false)
      return
    }

    await this.$store.dispatch('loadOptions')
  }
};
</script>
