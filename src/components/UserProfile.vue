<template>
  <div>
      <b-table
        stacked
        :items="[user]"
        :fields="['name', {key: 'idir', label:'IDIR'}, 'role', 'email', 'organizations']"
        >
        <template #cell(role)="cell">
          {{ lookup('roles', cell.item.role) }}
        </template>
        <template #cell(organizations)="cell">
          <span v-if="user.role !== 'orgContact'">n/a</span>
          <div v-for="orgId in cell.item.organizations" :key="orgId">
            {{ lookupOrganization(orgId) }}
          </div>
        </template>
      </b-table>
  </div>
</template>

<script>

import optionServices from '@/services/options.services'

export default {
  name: "user-profile",
  components: {},
  methods: {
    lookup(key, value) {
      return optionServices.lookup(key, value)
    },
    lookupOrganization(value) {
      const org = optionServices.lookup('organizations', parseInt(value), {
        organizations: this.$store.getters.getOrganizations || []
      })
      // return organization shortname
      return org ? org.substring(0, org.lastIndexOf("-")) : '';
    }
  },
  computed : {
    user () {
      return this.$store.getters.getUser
    }
  }
};
</script>

