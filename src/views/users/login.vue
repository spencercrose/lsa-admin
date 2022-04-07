<template>
  <b-container fluid v-if="!isLoading">
    <PageHeader header="Sign In" lead="Admin Authentication" />
    <b-alert v-if="isAuthenticated" variant="info" show>You are currently logged in.</b-alert>
    <b-alert v-if="isAuthenticated" variant="info" show>You are currently logged in.</b-alert>
    <b-form v-else @submit="submit()">
      <b-card
        header="Login"
        header-tag="header"
        bg-variant="light"
        class="mb-3"
      >
        <b-form-group id="fieldset-user-login">
          <b-form-group
            id="input-group-user-login-email"
            label="Email"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-email"
          >
            <b-form-input
              id="input-user-login-email"
              type="email"
              v-model="form.email"
              :state="validate('email')"
            >
            </b-form-input>

          </b-form-group>

          <b-form-group
            id="input-group-user-login-password"
            label="Password"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-password"
          >
            <b-form-input
              v-on:keyup.enter="submit"
              id="input-user-login-password"
              type="password"
              v-model="form.password"
              :state="validate('password')"
            >
            </b-form-input>

          </b-form-group>

          <b-button
            variant="info"
            :disabled="processing || !validate('all')"
            @click="submit()">
            Sign In
            <b-spinner class="ml-3" small v-if="this.processing" />
          </b-button>

        </b-form-group>
      </b-card>
    </b-form>
  </b-container>
</template>

<script>
import PageHeader from "@/components/PageHeader"
import { loginUser } from "@/services/auth.services";
import {validateEmail, validatePassword} from "@/services/validation.services";

export default {
  name: 'user-login',
  components: {
    PageHeader
  },
  data() {
    return {
      processing: false,
      form: {
        email: '',
        password: '',
        remember: false,
        errors: []
      }
    }
  },
  methods: {
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async submit() {
      this.processing = true
      const [error, user] = await loginUser(this.form)
      await this.$store.dispatch('setMessage', error
        ? error
        : {text: "Signed In Successfully", type: "success"}
      )
      // Signed In: Eet user data and redirect to dashboard
      if (user) {
        this.$store.commit('setUser', user)
        if (this.$route.name !== 'dashboard') await this.reroute('/')
      }
      this.processing = false
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    isLoading () {
      return this.$store.getters.isLoading
    },
    validate() {
      return (field) => {
        const fields = {
          email: () => {
            return validateEmail(this.form.email)
          },
          password: () => {
            return validatePassword(this.form.password)
          }
        }
        if (fields[field] === 'undefined') return false;

        // check if all fields validate
        if (field === 'all') return Object.keys(fields).filter(key => {
          return !fields[key]()
        }).length === 0;

        return !!fields[field]();
      }
    }
  }
}
</script>
