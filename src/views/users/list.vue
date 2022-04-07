<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-container v-if="!isLoading">
      <b-alert v-if="!isAdmin" variant="info" show>Sign in to view this page.</b-alert>
      <b-row>
<!--        <b-col>-->
<!--          <b-form-group-->
<!--            label="Selection Mode:"-->
<!--            label-for="table-select-mode-select"-->
<!--            label-cols-md="4"-->
<!--          >-->
<!--            <b-form-select-->
<!--              id="table-select-mode-select"-->
<!--              v-model="selectMode"-->
<!--              :options="modes"-->
<!--              class="mb-3"-->
<!--            ></b-form-select>-->
<!--          </b-form-group>-->
<!--        </b-col>-->
        <b-col class="mb-2" align="right">
<!--          <span v-if="selected.length > 0"> {{ selected.length }} Item(s) Selected</span>-->
<!--          <b-button class="m-1" size="sm" @click="selectAllRows">Select All</b-button>-->
<!--          <b-button class="m-1" size="sm" @click="clearSelected">Clear Selected</b-button>-->
          <b-button class="m-1" size="sm" @click="clearFilters">Clear Filters</b-button>
          <b-button class="m-1" size="sm" variant="info" @click="reroute('/users/register')">Add User</b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="Associated Organizations"
            label-for="table-select-filter-organization"
          >
            <b-form-select
              id="table-select-filter-organization"
              v-model="selectOrganization"
              :options="organizations"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="User Role"
            label-for="table-select-filter-retiring"
          >
            <b-form-select
              id="table-select-filter-retiring"
              v-model="selectRole"
              :options="roles"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
    </b-container>

    <b-table
      ref="selectableTable"
      primary-key="id"
      :items="items"
      :fields="fields"
      striped
      :filter="criteria"
      :filter-function="applyFilter"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :select-mode="selectMode"
      responsive="sm"
      selectable
      @row-selected="onRowSelected"
      :busy.sync="loading"
    >

      <!-- scoped slot for select state -->
<!--      <template #cell(selected)="{ rowSelected }">-->
<!--        <template v-if="rowSelected">-->
<!--          <div class="text-center" aria-hidden="true"><BIconCheckSquare/></div>-->
<!--          <span class="sr-only">Selected</span>-->
<!--        </template>-->
<!--        <template v-else>-->
<!--          <span aria-hidden="true">&nbsp;</span>-->
<!--          <span class="sr-only">Not selected</span>-->
<!--        </template>-->
<!--      </template>-->

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

      <template #cell(created)="row">
        {{ row.item.created.toLocaleString() }}
      </template>

      <template #cell(updated)="row">
        {{ row.item.updated.toLocaleString() }}
      </template>

      <template #cell(details)="row">
        <b-button
          size="sm"
          class="m-1"
          @click="reroute(`/users/view/${row.item.id}`)"
        >
          View
        </b-button>
        <b-button
          size="sm"
          class="m-1"
          @click="reroute(`/users/edit/${row.item.id}`)"
        >
          Edit
        </b-button>
        <b-button
          size="sm"
          class="m-1"
          @click="reroute(`/users/delete/${row.item.id}`)"
        >
          Delete
        </b-button>
      </template>

    </b-table>

    <b-alert v-if="error" show variant="danger">
      A server error occurred. Please contact the site administrator for assistance.
    </b-alert>

  </b-container>
</template>

<script>

import optionsServices from '@/services/options.services'
import PageHeader from '@/components/PageHeader'
import {getUsers} from "@/services/auth.services";
import optionServices from "@/services/options.services";

export default {
  name: 'recipients-list',
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data () {
    return {
      loading: false,
      error: false,
      message: '',
      sortBy: 'last_name',
      sortDesc: true,
      selected: [],
      items: [],
      modes: ['multi', 'single', 'range'],
      selectMode: 'multi',
      selectOrganization: '',
      selectRole: '',
      fields: [
          {key: 'name', sortable: true},
          {key: 'role', sortable: true},
          {key: 'organizations', sortable: true},
          {key: 'updated', sortable: true},
          {key: 'created', sortable: true},
          {key: 'details', label: '', sortable: false}
        ]
    }
  },
  computed: {
    isLoading () {
      return this.$store.getters.isLoading
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
    organizations () {
      return this.$store.getters.getOrganizations
    },
    criteria () {
      return {
        role: this.selectRole,
        organization: this.selectOrganization
      }
    },
    roles () {
      return optionServices.get("roles")
    }
  },
  methods: {
    onRowSelected(items) {
      this.selected = items
    },
    selectAllRows() {
      this.$refs.selectableTable.selectAllRows()
    },
    clearSelected() {
      this.$refs.selectableTable.clearSelected()
    },
    clearFilters() {
      this.selectRole = ''
      this.selectOrganization = ''
    },
    applyFilter(row) {
      const filterRole = !this.criteria.role
        || row.role === this.criteria.role
      const filterOrganization = !this.criteria.organization
        || row.organizations.includes(this.criteria.organization)
      return filterOrganization && filterRole
    },
    async loadUsers () {
      const [error, users] = await getUsers()
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }

      this.items = (users || []).map(user => {
        const {
          id=null,
          name='',
          roles=[],
          organizations=[],
          updated_at=null,
          created_at=null,
        } = user || {}

        const updatedTS = new Date(updated_at)
        const createdTS = new Date(created_at)
        const role = roles.length > 0 ? roles[0].name : 'unknown'
        return {
          id: id,
          name: name,
          role: role,
          organizations: organizations.map(org => {return org.id}),
          created: createdTS,
          updated: updatedTS,
        }
      })
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    lookup(key, value) {
      return optionsServices.lookup(key, value)
    },
    lookupOrganization(value) {
      const org = this.organizations.filter(org => {
        return String(org.value) === String(value)
      })
      if (org.length > 0) {
        const {text = ''} = org[0] || {}
        // return organization shortname
        return text ? text.substring(0, text.lastIndexOf("-")) : '';
      }
      return value
    }
  },
  async beforeMount () {
    this.$store.commit('setLoading', true)
    await this.loadUsers()
    this.$store.commit('setLoading', false)
  }
}
</script>
