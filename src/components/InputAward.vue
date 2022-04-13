<template>
  <b-container v-if="!isHistoricalRecipient || (isAdmin && isHistoricalRecipient)">
    <b-card
      v-if="recipient.milestones"
      header-tag="header"
      bg-variant="light"
      header-class="font-weight-bold"
      class="mb-3"
    >
      <template #header>
        Awards for Milestone Year {{ recipient.milestones }}
        <b-badge v-if="!!recipient.award.id" variant="success" show>Completed</b-badge>
      </template>

      <b-form-group
        id="fieldset-award"
        label="Select Recipient's Award"
        label-for="input-award"
      >
        <b-form-select
          id="input-award"
          v-model="recipient.award.id"
          :options="awards"
          :state="recipient.award.id !== ''"
          @change="resetOptions()"
        >
        </b-form-select>
        <b-form-invalid-feedback :state="recipient.award.id !== ''">
          This field is required.
        </b-form-invalid-feedback>

        <b-button
          class="m-2"
          size="sm"
          variant="info"
          :disabled="!recipient.award.id"
          @click="resetAwards">
          Clear Award Selection
        </b-button>

      </b-form-group>
      <p>{{description}}</p>
    </b-card>

    <div v-if="hasOptions && !!recipient.award.id">
      <InputAwardPECSF v-if="isPECSF" />
      <InputAwardWatch v-else-if="isWatch" />
      <InputAwardOptions v-else />
    </div>

  </b-container>
</template>

<script>

import InputAwardOptions from '@/components/InputAwardOptions'
import InputAwardPECSF from '@/components/InputAwardPECSF'
import InputAwardWatch from '@/components/InputAwardWatch'
import optionServices from "@/services/options.services";

export default {
  name: "input-award",
  components: {InputAwardOptions, InputAwardPECSF, InputAwardWatch},
  methods: {
    resetOptions: function() {
      // reset options available for the selected award
      this.$store.commit('setFormData', {
        award: {
          id: this.recipient.award.id,
          options: null,
          status: 'delegated'
        }
      })
      this.updateValidation()
    },
    resetAwards: function() {
      // reset options available for the selected award
      this.$store.commit('setFormData', {
        award: {
          id: null,
          options: null,
          status: 'delegated'
        }
      })
      this.updateValidation()
    },
    updateValidation: function() {
      // set validation
      const awardDetails = optionServices.getAwardDetails(
        this.recipient.award.id, this.$store.getters.getAwards || []
      )
      this.$store.commit('setFormValidation', {
        award: !!this.recipient.award.id || this.isHistoricalRecipient || this.isAdmin,
        award_options: (!!awardDetails && !!awardDetails.options)
          || this.isHistoricalRecipient || this.isAdmin || true
      })
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    },
    description() {
      const awardDetails = optionServices.getAwardDetails(
        this.recipient.award.id, this.$store.getters.getAwards || []
      )
      return awardDetails ? awardDetails.description || '' : ''
    },
    awards() {
      // load awards for requested milestone
      return (this.$store.getters.getAwards || []).map(award => {
        return {
          value: award.id || '',
          text: award.name || '',
        }
      })
    },
    hasOptions() {
      const awardDetails = optionServices.getAwardDetails(
        this.recipient.award.id, this.$store.getters.getAwards || []
      )
      const {options=null} = awardDetails || {}
      return !!options
    },
    isAdmin() {
      return this.$store.getters.isAdmin
    },
    isHistoricalRecipient() {
      return this.recipient.historical
    },
    isPECSF() {
      // check if award options are for a PECSF donation
      const { id=null } = this.recipient.award
      let availableOptions = optionServices.getAwardOptions(id, this.$store.getters.getAwards || []) || []
      return availableOptions.filter(opt => String(opt.key) === 'pecsf').length > 0
    },
    isWatch() {
      // check if award options are for a watch
      const { id=null } = this.recipient.award
      let availableOptions = optionServices.getAwardOptions(id, this.$store.getters.getAwards || []) || []
      return availableOptions.filter(opt => String(opt.key) === 'faces').length > 0
    }
  },
  async mounted() {
    this.updateValidation()
  }
};
</script>
