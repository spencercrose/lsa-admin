<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-container v-if="!isLoading">
      <b-alert v-if="isHistoricalRecipient" show variant="info">
        This recipient has previously selected an award.
      </b-alert>
      <b-alert v-if="error" variant="danger" show>{{error}}</b-alert>
      <InputIdentification />
      <InputPersonal />
      <InputMilestone />
      <InputAward />
      <InputSupervisor />
      <InputDeclarations />
      <InputAdminNotes />
      <b-button-group class="w-100">
        <b-button
          variant="info"
          :disabled="processing || !isValid"
          @click="submit()">
          {{ this.mode === 'create' ? 'Register' : 'Update'}}
          <b-spinner class="ml-3" small v-if="processing" />
        </b-button>
        <b-button
          variant="secondary"
          :disabled="processing"
          @click="reroute(`/recipients/`)">
          Cancel
        </b-button>
      </b-button-group>
      <b-form-invalid-feedback :state="isValid">
        Form is invalid or incomplete.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="isValid">
        Form is complete and valid.
      </b-form-valid-feedback>

      <b-row align="right" v-if="recipient.id">
        <b-col>
          <router-link :to="`/recipients/view/${recipient.id}`">View</router-link>
          |
          <router-link :to="`/recipients/delete/${recipient.id}`">Delete</router-link>
        </b-col>
      </b-row>

    </b-container>

  </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import InputPersonal from '@/components/InputPersonal'
import InputIdentification from '@/components/InputIdentification'
import InputMilestone from '@/components/InputMilestone'
import InputAward from '@/components/InputAward'
import InputSupervisor from '@/components/InputSupervisor'
import InputDeclarations from '@/components/InputDeclarations'
import InputAdminNotes from '@/components/InputAdminNotes'
import { createRecipient, updateRecipient } from "@/services/api.services";
import {getRecipient} from "../../services/api.services";

const initRecipient = {
  id: null,
  historical: false,
  historical_milestone: '',
  historical_milestone_year: '',
  admin_notes: '',
  guid: null,
  idir: null,
  employee_number: null,
  first_name: null,
  last_name: null,
  government_email: null,
  government_phone_number: null,
  personal_phone_number: null,
  personal_email: null,
  organization_id: null,
  branch_name: null,
  milestones: '',
  qualifying_year: '',
  is_bcgeu_member: 0,
  retiring_this_year: 0,
  retirement_date: null,
  award: {
    id: null,
    options: null,
    status: 'delegated',
  },
  is_declared: 0,
  survey_participation: 0,
  ceremony_opt_out: 0,
  office_address: {
    id: null,
    prefix: '',
    street_address: '',
    postal_code: null,
    community: ''
  },
  supervisor_first_name: '',
  supervisor_last_name: '',
  supervisor_email: '',
  supervisor_address: {
    id: null,
    pobox: '',
    prefix: '',
    street_address: '',
    postal_code: null,
    community: ''
  },
  personal_address: {
    id: null,
    prefix: '',
    street_address: '',
    postal_code: null,
    community: ''
  }
}

const initValidation = {
  identification: false,
  office_address: false,
  milestone: false,
  award: false,
  award_options: false,
  supervisor_contact: false,
  supervisor_address: false,
  confirmations: false
}

export default {
  head: {
    title: 'Register User',
  },
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader,
    InputIdentification,
    InputMilestone,
    InputAward,
    InputSupervisor,
    InputPersonal,
    InputDeclarations,
    InputAdminNotes
  },
  data() {
    return {
      processing: false,
      error: ''
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData
    },
    isLoading() {
      return this.$store.getters.isLoading || !this.recipient
    },
    isValid() {
      return this.$store.getters.isValid
    },
    isHistoricalRecipient() {
      const {historical=null} = this.$store.getters.getFormData || {}
      return historical
    }
  },
  methods: {
    async submit() {
      console.log('Saving:', this.recipient)
      this.processing = true

      const [error, result] = this.mode === 'create'
        ? await createRecipient(this.recipient)
        : await updateRecipient(this.$route.params.id, this.recipient)

      const { id='' } = result || {}
      if (error || !id) {
        console.error(error, result)
        this.$store.commit('setMessage', {
            text: 'Recipient could not be saved. An error occurred.',
            type: 'danger'
          }
        )
      }
      else {
        // successful update
        this.$store.commit('setMessage', {
          text: this.mode === 'create'
            ? 'Recipient successfully registered'
            : 'Recipient successfully updated',
          type: 'success'
        })
        // redirect to manage recipients
        this.mode === 'create' ? await this.$router.push(`/recipients/`) : ()=>{}
      }

      this.processing = false
    },
    async reroute(uri) {
      await this.$router.push(uri)
    }
  },
  async mounted() {
    this.$store.commit('setLoading', true)

    // initialize recipient data
    const [error, initData] = this.mode === 'edit'
      ? await getRecipient(this.$route.params.id || '')
      : [null, initRecipient]

    if (error) {
      this.$store.commit('setMessage', error)
      this.error = error.text
    }
    else {
      // initialize recipient data
      this.$store.commit('setFormData', initData)
      this.$store.commit('setFormValidation', initValidation)
    }
    this.$store.commit('setLoading', false)
  }
}
</script>
