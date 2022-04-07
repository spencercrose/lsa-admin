<template>
  <b-container>
      <b-card
        header-tag="header"
        bg-variant="light"
        header-class="font-weight-bold"
        class="mb-3"
      >
        <template #header>
          Milestone Details <b-badge v-if="validate('all')" variant="success" show>Completed</b-badge>
        </template>
        <b-form-group>
          <b-alert v-if="isHistoricalRecipient" variant="info" show>
            This recipient has previously registered for an award.
            <ul>
              <li>Milestone: {{recipient.historical_milestone || 'n/a'}}</li>
              <li>Qualifying Year: {{recipient.historical_milestone_year || 'n/a'}}</li>
            </ul>
          </b-alert>
          <b-form-group
            v-if="!isHistoricalRecipient || isAdmin"
            id="input-group-milestone"
            label="Select Recipient's Milestone"
            label-for="input-milestone"
            label-class="font-weight-bold"
            class="mb-4"
          >
            <b-form-select
              id="input-milestone"
              v-model="recipient.milestones"
              :options="options.milestones"
              :state="validate('milestone')"
              @change="selectMilestone(recipient.milestones)"
            >
            </b-form-select>
            <b-form-invalid-feedback :state="validate('milestone')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            v-if="!isHistoricalRecipient || isAdmin"
            id="fieldset-milestone-qualifying-year"
            label="Qualifying Year"
            label-size="md"
            label-class="font-weight-bold"
            label-for="input-milestone-qualifying-year"
            class="mb-4"
          >
            <b-form-radio
              v-for="(year, counter) in options.qualifyingYears"
              v-bind:key="counter"
              v-model="recipient.qualifying_year"
              name="input-milestone-qualifying-year"
              :value="year.value"
              :state="validate('qualifyingYear')"
              @change="updateValidation()"
            >
              {{year.text}}
            </b-form-radio>
            <b-form-invalid-feedback :state="validate('qualifyingYear')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form-group>

        <b-form-group
          id="fieldset-milestone-retirement"
          label="Retirement"
          label-size="md"
          label-class="font-weight-bold"
          label-for="input-milestone-retirement"
          class="mb-4"
        >
          <b-form-checkbox
            id="input-milestone-retirement"
            v-model="recipient.retiring_this_year"
            :value="1"
            :unchecked-value="0"
            @change="resetRetirementDate()"
          >Confirm retirement in {{new Date().getFullYear()}}</b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="fieldset-milestone-retirement-date"
          label="Retirement Date"
          label-size="md"
          label-class="font-weight-bold"
          label-for="input-milestone-retirement-date"
          class="mb-4"
        >
          <b-form-datepicker
            id="input-milestone-retirement-date"
            v-model="recipient.retirement_date"
            :min="currentDate"
            :max="maxDate"
            locale="en"
            :disabled="!recipient.retiring_this_year"
            @input="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('retirementDate')">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>
      </b-card>
  </b-container>
</template>

<script>

import optionServices from '@/services/options.services'

const initAwardOptions = {
  award: {
    id: null,
    options: null,
    name: '',
    status: 'delegated'
  }
}

export default {
  name: "input-milestone",
  data() {
    return {
      options: {
        qualifyingYears: optionServices.get('qualifying-years'),
        milestones: optionServices.get('milestones')
      }
    }
  },
  methods: {
    async selectMilestone (milestone) {
      // update milestone validation
      this.updateValidation()
      // reset award selection
      this.$store.commit('setFormData', initAwardOptions)
      // load awards for given milestone year
      await this.$store.dispatch('loadAwards', milestone)
      // reset award validation
      this.$store.commit('setFormValidation', {award: this.isAdmin})
    },
    resetRetirementDate() {
      this.$store.commit('setFormData', { retirement_date: null })
      // update validation
      this.updateValidation()
    },
    updateValidation() {
      this.$store.commit('setFormValidation', {milestone: this.validate('all')})
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    },
    validate(){
      return (field) => {
        const fields = {
          milestone: ()=>{
            return !!parseInt(this.recipient.milestones) || this.isHistoricalRecipient
          },
          qualifyingYear: ()=>{
            return !!parseInt(this.recipient.qualifying_year) || this.isHistoricalRecipient
          },
          retirementDate: ()=>{
            return !parseInt(this.recipient.retiring_this_year) || !!Date.parse(this.recipient.retirement_date)
          }
        }
        // check if all fields validate
        // - store validation of section
        if (field === 'all') return Object.keys(fields).filter(key => {
          return !fields[key]()
        }).length === 0

        if (!fields[field]) return false;
        return !!fields[field]();
      }
    },
    currentDate() {
      return new Date();
    },
    maxDate() {
      const n = 1
      const thisDate = new Date()
      return new Date(thisDate.setFullYear(thisDate.getFullYear() + n))
    },
    isHistoricalRecipient() {
      return this.$store.getters.getFormData.historical
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    }
  },
  async mounted() {
    this.updateValidation()
    const {milestones='', retiring_this_year=null} = this.recipient
    // reset retirement date if not retiring
    if (!retiring_this_year) this.resetRetirementDate()
    // load awards for milestone
    if (milestones) await this.$store.dispatch('loadAwards', milestones)
  }
};
</script>
