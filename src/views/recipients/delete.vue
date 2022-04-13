<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-card id="recipient-delete" title="Recipient Profile" v-if="!isLoading">
      <b-table
        stacked :items="[recipient]"
        :fields="['first_name', 'last_name', 'employee_number', 'personal_email']">
      </b-table>
      <b-card-footer align="center">
        <b-button
          :disabled="processing"
          class="m-2"
          type="button"
          @click="submit()"
        >Delete</b-button>
        <b-button
          class="m-2"
          type="button"
          variant="secondary"
          @click="reroute('/recipients')"
        >Cancel</b-button>
      </b-card-footer>
    </b-card>
  </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import {deleteRecipient, getRecipient} from "../../services/api.services";

export default {
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader,
  },
  data() {
    return {
      recipient: null,
      processing: false
    }
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading || !this.recipient
    }
  },
  methods: {
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async submit() {
      console.log('Deleting:', this.recipient)
      this.processing = true
      const [error, result] = await deleteRecipient(this.recipient.id)

      console.log(error, result)
      const { id='' } = result || {}
      if (error || !id) this.$store.commit('setMessage', {
        text: 'An error occurred. Your deletion could not be completed',
        type: 'danger'
      })
      else {
        // successful deletion
        this.$store.commit('setMessage', {
          text: `Recipient ${this.recipient.first_name || ''} ${this.recipient.last_name || ''} successfully deleted`, type: 'success'
        })
        // redirect to manage recipients
        await this.reroute(`/recipients/`)
      }
      this.processing = false
    }
  },
  async beforeCreate() {
    this.$store.commit('setLoading', true)
    // initialize recipient data
    const [error, data] = await getRecipient(this.$route.params.id || '')
    if (error) {
      this.$store.commit('setMessage', error)
    }
    this.recipient = data

    this.$store.commit('setLoading', false)
  }
}
</script>
