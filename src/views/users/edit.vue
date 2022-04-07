<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-form v-if="!isLoading">
      <b-card
        :header="isRegistration ? 'Register User' : 'Update User Data'"
        header-tag="header"
        bg-variant="light"
        header-class="font-weight-bold"
        class="mb-3"
      >
        <b-form-group id="fieldset-user-registration">
          <b-form-group
            id="input-group-user-name"
            label="Full Name"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-email"
          >
            <b-form-input
              id="input-user-name"
              v-model="user.name"
              :state="validate('name')"
            >
            </b-form-input>
            <b-form-invalid-feedback :state="validate('name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-group-user-email"
            label="Email"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-email"
          >
            <b-form-input
              id="input-user-email"
              v-model="user.email"
              autocomplete="on"
              :state="validate('email')"
            >
            </b-form-input>
            <b-form-invalid-feedback :state="validate('email')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-group-user-role"
            label="Select User Role"
            label-class="font-weight-bold"
            label-for="input-user-role"
          >
            <b-form-select
              id="input-user-role"
              v-model="user.role"
              :options="roles"
            >
            </b-form-select>
            <b-form-invalid-feedback :state="validate('role')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-group-organization"
            label="Associated Organizations"
            label-class="font-weight-bold"
            label-for="input-user-organization"
          >
            <b-form-select
              id="input-user-organization"
              v-model="user.organizations"
              :options="organizations"
              :disabled="!isOrgContact"
              multiple
            >
            </b-form-select>
            <b-form-invalid-feedback :state="validate('organizations')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-group-user-idir"
            label="IDIR"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-idir"
            description="Optional"
          >
            <b-form-input id="input-user-idir" v-model="user.idir"></b-form-input>
          </b-form-group>

          <b-form-group
            id="input-group-user-guid"
            label="GUID"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-guid"
            description="Optional"
          >
            <b-form-input id="input-user-guid" v-model="user.guid"></b-form-input>
          </b-form-group>

          <b-form-group
            v-if="isRegistration"
            id="input-group-user-password"
            label="Password"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-password"
          >
            <b-form-input
              type="password"
              id="input-user-password"
              v-model="user.password"
              autocomplete="on"
              :state="validate('password')"
            >
            </b-form-input>
            <b-form-invalid-feedback :state="validate('password')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            v-if="isRegistration"
            id="input-group-user-password-confirmation"
            label="Password Confirmation"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-user-login-password-confirmation"
          >
            <b-form-input
              type="password"
              id="input-user-password-confirmation"
              v-model="user.password_confirmation"
              autocomplete="off"
              :state="validate('password_confirmation')"
            >
            </b-form-input>
            <b-form-invalid-feedback :state="validate('password_confirmation')">
              This field is required. Passwords must match.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-button
            variant="info"
            :disabled="user.processing || !validate('all')"
            @click="submit()">
            <b-spinner class="ml-3" small v-if="this.user.processing" />
            {{ isRegistration ? 'Register' : 'Update'}}
          </b-button>

        </b-form-group>

      </b-card>
    </b-form>
  </b-container>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import { registerUser, updateUser, getUser } from "@/services/auth.services";
import {validateText, validateEmail, validatePassword} from "@/services/validation.services";
import optServices from "@/services/options.services";

const initUser = {
  name: '',
  idir: '',
  guid: '',
  role: '',
  email: '',
  organizations: [],
  password: '',
  password_confirmation: ''
}

export default {
  head: {
    title: 'Register User',
  },
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data() {
    return {
      processing: false,
    }
  },
  computed: {
    user() {
      return this.$store.getters.getFormData
    },
    organizations() {
      return this.$store.getters.getOrganizations.filter(org => {
        return !!org.value
      }) || []
    },
    roles() {
      return optServices.get('roles')
    },
    isLoading() {
      return this.$store.getters.isLoading || this.$store.getters.getOrganizations.length === 0
    },
    isOrgContact() {
      return this.user.role === 'orgContact'
    },
    isRegistration () {
      return this.mode === 'create'
    },
    validate(){
      return (field) => {
        const fields = {
          name: ()=>{
            return validateText(this.user.name)
          },
          email: ()=>{
            return validateEmail(this.user.email)
          },
          role: ()=>{
            return !!this.user.role
          },
          password: ()=>{
            return !this.isRegistration || validatePassword(this.user.password)
          },
          password_confirmation: ()=>{
            return !this.isRegistration
              || (
                validatePassword(this.user.password)
                && (this.user.password === this.user.password_confirmation)
              )
          },
          organizations: ()=>{
            return !this.isOrgContact || ( this.isOrgContact
              && this.user.organizations.length > 0 )
          }
        }
        if (fields[field] === 'undefined') return false;
        // check if all fields validate
        if (field === 'all') return Object.keys(fields || {}).filter(key => {
          return !fields[key]()
        }).length === 0;
        return !!fields[field]();
      }
    }
  },
  methods: {
    async submit() {
      this.processing = true
      const [error, result] = this.isRegistration
        ? await registerUser(this.user)
        : await updateUser(this.$route.params.id, this.user)
      if (error) {
        console.log('>>>', error, result)
        this.$store.commit('setMessage', {
            text: 'User could not be saved. An error occurred.',
            type: 'danger'
          }
        )
      }
      else {
        // successful update
        this.$store.commit('setMessage', {
          text: this.isRegistration
            ? 'Admin user successfully registered'
            : 'Admin user successfully updated',
          type: 'success'
        })
        // redirect to manage users
        this.isRegistration ? await this.$router.push(`/users/`) : ()=>{}
      }

      this.processing = false
    }
  },
  async created() {
    this.$store.commit('setLoading', true)

    // initialize recipient data
    const [error, user] = this.isRegistration
      ? [null, initUser]
      : await getUser(this.$route.params.id || '')
    if (error) this.$store.commit('setMessage', error)

    const {
      id = '',
      name = '',
      idir = '',
      guid = '',
      roles = [],
      email = '',
      organizations = []
    } = user || {}

    // initialize user role
    const role = roles.length > 0 ? roles[0].name : null

    // save in store
    this.$store.commit('setFormData', {
      id: id || '',
      name: name || '',
      idir: idir || '',
      guid: guid || '',
      email: email || '',
      role: role,
      organizations: organizations.map(org => {return org.id})
    })

    this.$store.commit('setLoading', false)
  }
}
</script>
