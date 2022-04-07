<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-form v-if="!isLoading">
      <b-card
        :header="isCreate ? 'Create Ceremony' : 'Update Ceremony'"
        header-tag="header"
        bg-variant="light"
        header-class="font-weight-bold"
        class="mb-3"
      >
        <b-form-group
          id="fieldset-ceremony-scheduled-date"
          label="Scheduled Date"
          label-size="md"
          label-class="font-weight-bold"
          label-for="input-ceremony-scheduled-date"
          class="mb-4"
        >
          <b-form-datepicker
            id="input-ceremony-scheduled-date"
            v-model="date"
            :min="minDate"
            :max="maxDate"
            locale="en"
            :state="!!date"
          />
          <b-form-invalid-feedback :state="!!date">
            This field is required.
          </b-form-invalid-feedback>

          <b-form-group
            id="fieldset-ceremony-scheduled-time"
            label="Scheduled Time"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-ceremony-scheduled-time"
            class="mt-2 mb-4"
          >
            <b-form-timepicker
              id="input-ceremony-scheduled-time"
              v-model="time"
              :min="minDate"
              :max="maxDate"
              locale="en"
              :state="!!time && !!date"
            />
            <b-form-invalid-feedback :state="!!time && !!date">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-button
            class="mt-2"
            variant="info"
            :disabled="!validate() || processing"
            @click="submit()">
            {{ isCreate ? 'Create' : 'Update'}}
            <b-spinner class="ml-3" small v-if="processing" />
          </b-button>

          <b-button
            class="mt-2 ml-2"
            variant="secondary"
            :disabled="processing"
            @click="reroute('/ceremonies')">
            Return to Ceremonies
          </b-button>

        </b-form-group>
      </b-card>
    </b-form>
  </b-container>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import { get, put, post } from "@/services/api.services";

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
      id: '',
      date: '',
      time: ''
    }
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading || this.$store.getters.getOrganizations.length === 0
    },
    isOrgContact() {
      return this.user.role === 'orgContact'
    },
    isCreate () {
      return this.mode === 'create'
    },
    minDate() {
      const n = -1
      const thisDate = new Date()
      return new Date(thisDate.setFullYear(thisDate.getFullYear() + n))
    },
    maxDate() {
      const n = 1
      const thisDate = new Date()
      return new Date(thisDate.setFullYear(thisDate.getFullYear() + n))
    },
  },
  methods: {
    validate() {
      return !!this.date && !!this.time
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async submit() {
      this.processing = true

      // combine date and time
      const datetime = `${this.date} ${this.time}`
      console.log(this.date, datetime)

      const [error,] = this.isCreate
        ? await post(`ceremonies/create`, {
          scheduled_datetime: datetime
        })
        : await put(`ceremonies/update/${this.$route.params.id}`, {
          id: this.id,
          scheduled_datetime: datetime
        })

      if (error) {
        this.$store.commit('setMessage', {
            text: 'Ceremony could not be saved. An error occurred.',
            type: 'danger'
          }
        )
      }
      else {
        // successful update
        this.$store.commit('setMessage', {
          text: this.isCreate
            ? 'Ceremony successfully created'
            : 'Ceremony successfully updated',
          type: 'success'
        })
        // redirect to manage users
        this.isCreate ? await this.$router.push(`/ceremonies/`) : ()=>{}
      }

      this.processing = false
    }
  },
  async created() {
    this.$store.commit('setLoading', true)

    // initialize data
    const [error, data] = this.isCreate
      ? [null, {}]
      : await get(`ceremonies/show/${this.$route.params.id}` || '')

    if (error) this.$store.commit('setMessage', error)

    // format date string
    const datetime = new Date(data.scheduled_datetime)
    this.id = data.id || ''
    this.date = datetime.toISOString().split('T')[0]
    this.time = datetime.toLocaleTimeString('en-US', { hour12: false }) || ''

    this.$store.commit('setLoading', false)
  }
}
</script>
