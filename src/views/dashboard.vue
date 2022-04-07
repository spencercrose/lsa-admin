<template>
  <b-container fluid>
    <PageHeader header="Dashboard" lead="Administration Dashboard" />
    <b-alert v-if="!isAuthenticated && !isLoading" variant="warning" show>You are not logged in.</b-alert>
    <b-container v-else>
      <div>
        <b-card-group deck>
          <b-card title="Register Award Recipients">
            <b-card-text>
              <p>Register Long Service Award recipients as well as view and edit their record data.</p>
            </b-card-text>
            <template #footer>
              <b-button
                block
                variant="info"
                @click="reroute(`/recipients/create`)"
              >Register Recipient
              </b-button>
            </template>
          </b-card>
          <b-card title="Manage Award Recipients">
            <b-card-text>
              <p>View and edit Long Service Award recipient records.</p>
            </b-card-text>
            <template #footer>
              <b-button
                block
                variant="info"
                @click="reroute(`/recipients/`)"
              >Recipients List
              </b-button>
            </template>
          </b-card>
        </b-card-group>
      </div>
    </b-container>

  </b-container>
</template>

<script>

import PageHeader from "../components/PageHeader";

export default {
  name: 'dashboard',
  components: {
    PageHeader
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    }
  },
  methods: {
    async reroute(uri) {
      await this.$router.push(uri)
    }
  }
}
</script>
