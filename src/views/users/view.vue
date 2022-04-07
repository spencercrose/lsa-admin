<template>
    <b-container fluid>
      <PageHeader :header="this.header" :lead="this.lead" />

      <b-container v-if="!isLoading">
        <b-row align="right">
          <b-col>
            <b-button size="sm" variant="info" class="m-1" @click="reroute(`/users/edit/${user.id}`)">
              Edit
            </b-button>
            <b-button size="sm" variant="danger" class="m-1" @click="reroute(`/users/delete/${user.id}`)">
              Delete
            </b-button>
          </b-col>
        </b-row>
        <b-card
          header="User Info"
          header-tag="header"
          bg-variant="light"
          header-class="font-weight-bold"
          class="mb-3"
        >
          <b-container class="p-3">
            <b-row>
              <b-col>
                <b-table
                  stacked
                  :items="[user]"
                  :fields="[
                    {key: 'name', label: 'Full Name'},
                    {key: 'email', label: 'Email'},
                    {key: 'role', label: 'User Role'},
                    {key: 'idir', label: 'IDIR'},
                    {key: 'guid', label: 'GUID'},
                    {key: 'organizations', label: 'Organizations'},
                    {key: 'updated_at', label: 'Updated'},
                    {key: 'created_at', label: 'Created'}
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(organizations)="row">
                    <div v-if="row.item.organizations.length === 0">
                      n/a
                    </div>
                    <div v-else v-for="orgId in row.item.organizations" :key="orgId">
                      {{ lookupOrganization(orgId) }}
                    </div>
                  </template>

                  <template #cell(role)="row">
                    {{ lookup('roles', row.item.role) }}
                  </template>

                  <template #cell(created_at)="row">
                    {{ row.item.created_at.toLocaleString() }}
                  </template>

                  <template #cell(updated_at)="row">
                    {{ row.item.updated_at.toLocaleString() }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-card>
      </b-container>
    </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import optionServices from '@/services/options.services'
import {getUser} from "../../services/auth.services";

export default {
  name: "users-view",
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data () {
    return {
      user: null
    }
  },
  methods: {
    async loadUser () {
      const [error, data] = await getUser(this.$route.params.id || null)
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }
      const {
        id=null,
        name='',
        email='',
        roles=[],
        organizations=[],
        updated_at=null,
        created_at=null,
      } = data || {}

      console.log(data)

      const updatedTS = new Date(updated_at)
      const createdTS = new Date(created_at)
      const role = roles.length > 0 ? roles[0].name : 'unknown'
      this.user = {
        id: id,
        name: name,
        email: email,
        role: role,
        organizations: organizations.map(org => {return org.id}),
        created_at: createdTS,
        updated_at: updatedTS,
      }
    },
    lookup(key, value) {
      return optionServices.lookup(key, value)
    },
    lookupOrganization(value) {
      return optionServices.lookup('organizations', parseInt(value), {organizations: this.organizations})
    },
    async reroute(uri) {
      await this.$router.push(uri)
    }
  },
  computed: {
    organizations() {
      return this.$store.getters.getOrganizations || []
    },
    isLoading() {
      return this.$store.getters.isLoading || !this.user
    }
  },
  async mounted () {
    this.$store.commit('setLoading', true)
    await this.loadUser()
    this.$store.commit('setLoading', false)
  }
}
</script>
