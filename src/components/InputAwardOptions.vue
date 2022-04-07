<template>
  <b-card
    header-tag="header"
    bg-variant="light"
    header-class="font-weight-bold"
    class="mb-3"
  >
    <template #header>
      Award Options
      <b-badge v-if="validate('all')" variant="success" show>Completed</b-badge>
    </template>

    <b-form-group>
      <b-form-group
        v-for="(awardOption, index) in awardOptions"
        v-bind:key="index"
        :id='`input-group-award-options-${index}`'
        :label="`${awardOption.label}`"
        :label-for='`input-award-options-${index}`'
        label-class="font-weight-bold"
        class="mb-4"
        :description="awardOption.description || ''"
      >
        <b-form-group v-if="awardOption.options">
          <b-form-select
            :id='`input-award-options-${index}`'
            v-model="awardOption.selected"
            :options="awardOption.options"
            :state="!!awardOption.selected"
            :disabled="awardOption.disabled"
            @change="updateOptions(awardOption)"
          >
          </b-form-select>
          <b-form-invalid-feedback :state="!!awardOption.selected">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          v-if="awardOption.key === 'certificate'"
          id="input-group-award-option-certificate"
        >
          <b-form-input
            id="input-award-options-certificate"
            v-model="awardOption.selected"
            placeholder="Enter a name here"
            :state="!!awardOption.selected"
            @update="updateOptions(awardOption)"
          />
          <b-form-invalid-feedback :state="!!awardOption.selected">
            This field is required.
          </b-form-invalid-feedback>
          <b-form-valid-feedback :state="!!awardOption.selected">
            To appear on your certificate: <b>"</b>{{awardOption.selected}}<b>"</b>
          </b-form-valid-feedback>
        </b-form-group>
      </b-form-group>
    </b-form-group>
  </b-card>
</template>

<script>

import optionServices from "@/services/options.services";
import {validateAwardOptions} from "@/services/validation.services";

export default {
  name: "input-award-options-other",
  components: {},
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    },
    awardOptions() {

      // get the current award selection + selected options
      const { id=null, options={} } = this.recipient.award || {}

      // init available options for this award
      let availableOptions = optionServices.getAwardOptions(id, this.$store.getters.getAwards)

      // reject null award options in available options
      if (!availableOptions) return []

      // select filtered award options by award type
      const { selections = [] } = options || {}

      // update available options with current selections
      return availableOptions.map(option => {
        selections.forEach(selectedOption => {
          if (selectedOption.key === option.key) {
            option.selected = selectedOption.value
          }
        })
        return option
      })
    },
    validate(){
      return (field) => {
        return validateAwardOptions('other', field, this.recipient.award)
      }
    }
  },
  methods: {
    updateOptions() {
      const updatedOptions = {
        selections: (this.awardOptions || []).map(option => {
          return {
            key: option.key,
            value: option.selected
          }
        })
      }
      this.$store.commit('setFormData', {
        award: {
          id: this.recipient.award.id || null,
          options: updatedOptions,
          status: this.recipient.award.status,
        }
      })
    }
  }
}
</script>
