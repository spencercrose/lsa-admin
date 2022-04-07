<template>
  <b-card
    header-tag="header"
    bg-variant="light"
    header-class="font-weight-bold"
    class="mb-3"
  >
    <template #header>
      Award Options: PECSF Donation
      <b-badge v-if="validate('all')" variant="success" show>Completed</b-badge>
    </template>

    <b-form-group
      id="input-group-award-options-pecsf"
      label="Choose Donation Option"
      label-class="font-weight-bold"
    >
      <b-form-radio
        v-model="selected.pecsfPool"
        name="donatationOptions"
        @change="updateSelection()"
        :value="true">Donate to the PECSF Regional Pool Fund</b-form-radio>
      <b-form-radio
        v-model="selected.pecsfPool"
        name="donatationOptions"
        @change="updateSelection()"
        :value="false">Donate to a registered charitable organization (maximum of two)</b-form-radio>

    </b-form-group>

    <b-form-group
      id="input-group-award-options-pecsf-region-1"
      label="Choose a region for your first donation"
      label-class="font-weight-bold"
      label-for="input-award-options-pecsf-region-1"
      class="mb-4"
    >
      <b-form-select
        id="input-award-options-pecsf-region-1"
        v-model="selected.pecsfRegion1"
        :options="pecsfOptions.regions"
        :state="validate('pecsfRegion1')"
        @change="updateSelection()"
      >
      </b-form-select>
      <b-form-invalid-feedback :state="validate('pecsfRegion1')">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-pecsf-charity-1"
      label="Choose a charity for your first donation"
      label-class="font-weight-bold"
      label-for="input-award-options-pecsf-charity-1"
      class="mb-4"
    >
      <b-form-select
        id="input-award-options-pecsf-charity-1"
        v-model="selected.pecsfCharity1"
        :options="selected.pecsfRegion1
              ? pecsfOptions.charities.filter(charity => {
                return charity.region === selected.pecsfRegion1
              })
              : [{key: null, text: 'Select a region to view charities.'}]"
        :disabled="disabled.pecsfCharity1"
        @change="updateSelection()"
      >
        {{selected.pecsfRegion1}}
      </b-form-select>
      <b-form-invalid-feedback :state="validate('pecsfCharity1')">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-pecsf-region-2"
      label="Choose a region for your second donation"
      label-class="font-weight-bold"
      label-for="input-award-options-pecsf-region-2"
      class="mb-4"
      description="Optional"
    >
      <b-form-select
        id="input-award-options-pecsf-region-2"
        v-model="selected.pecsfRegion2"
        :options="pecsfOptions.regions"
        :disabled="disabled.pecsfRegion2"
        @change="updateSelection()"
      >
      </b-form-select>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-pecsf-charity-2"
      label="Choose a charity for your second donation"
      label-class="font-weight-bold"
      label-for="input-award-options-pecsf-charity-2"
      class="mb-4"
      description="Optional"
    >
      <b-form-select
        id="input-award-options-pecsf-charity-2"
        v-model="selected.pecsfCharity2"
        :options="selected.pecsfRegion2
              ? pecsfOptions.charities.filter(charity => {
                return charity.region === selected.pecsfRegion2
              })
              : [{key: null, text: 'Select a region to view charities.'}]"
        :disabled="disabled.pecsfCharity2"
        @change="updateSelection()"
      >
      </b-form-select>
      <b-form-invalid-feedback :state="validate('pecsfCharity2')">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-pecsf-behalf"
      label="Name for PECSF Donation certificate"
      label-for="input-award-options-pecsf-behalf"
      label-class="font-weight-bold"
    >
      <b-form-input
        id="input-award-options-pecsf-behalf"
        v-model="selected.honour"
        placeholder="Enter name here"
        :disabled="disabled.honour"
        :state="validate('honour')"
        @update="updateSelection()"
      />
      <b-form-invalid-feedback :state="validate('honour')">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      v-if="hasCertificate"
      id="input-group-award-option-certificate"
      label="Name for 25 Year Certificate"
      label-for="input-award-options-certificate"
      label-class="font-weight-bold"
    >
      <b-form-input
        id="input-award-options-certificate"
        v-model="selected.certificate"
        placeholder="Enter a name here"
        :state="validate('certificate')"
        @update="updateSelection()"
      />
      <b-form-invalid-feedback :state="validate('certificate')">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

  </b-card>

</template>

<script>


import {validateAwardOptions} from "@/services/validation.services";
import optionServices from "@/services/options.services";

export default {
  name: "input-award-options-pecsf",
  data: function () {
    return {
      disabled: {
        pecsfRegion1: true,
        pecsfCharity1: true,
        pecsfRegion2: true,
        pecsfCharity2: true,
        honour: false,
      }
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    },
    selected() {
      // get the current award selection + selected options
      const { options={} } = this.recipient.award
      const {selections=[]} = options || {}
      let filteredOptions = this.hasCertificate
        ? {
          pecsfPool: true,
          pecsfRegion1: null,
          pecsfCharity1: null,
          pecsfRegion2: null,
          pecsfCharity2: null,
          honour: null,
          certificate: null
        }
        : {
          pecsfPool: true,
          pecsfRegion1: null,
          pecsfCharity1: null,
          pecsfRegion2: null,
          pecsfCharity2: null,
          honour: null
        }
      // convert array of options to indexed object
      selections.forEach(option => {
        filteredOptions[option.key] = option.value
      })
      return filteredOptions
    },
    hasCertificate() {
      // check if award options are for a PECSF donation
      const { id=null } = this.recipient.award
      let availableOptions = optionServices.getAwardOptions(id, this.$store.getters.getAwards || []) || []
      return availableOptions.filter(opt => String(opt.key) === 'certificate').length > 0
    },
    pecsfOptions() {
      return this.$store.getters.getPecsfOptions
    },
    validate(){
      return (field) => {
        return validateAwardOptions('pecsf', field, this.recipient.award)
      }
    },
  },
  methods: {
    updateSelection() {
      // disable other region/charity options if selecting donation pool
      if (this.selected.pecsfPool) {
        this.selected.pecsfCharity1 = null
        this.selected.pecsfRegion2 = null
        this.selected.pecsfCharity2 = null
        this.disabled.pecsfCharity1 = true
        this.disabled.pecsfRegion2 = true
        this.disabled.pecsfCharity2 = true
      } else {
        this.disabled.pecsfRegion2 = false
        this.disabled.pecsfCharity1 = !this.selected.pecsfRegion1
        this.disabled.pecsfCharity2 = !this.selected.pecsfRegion2
        if (this.disabled.pecsfCharity1) this.selected.pecsfCharity1 = null
        if (this.disabled.pecsfCharity2) this.selected.pecsfCharity2 = null
      }
      const updatedOptions = Object.keys(this.selected || {}).map(key => {
        return {
          key: key,
          value: this.selected[key]
        }
      })
      this.$store.commit('setFormData', {
        award: {
          id: this.recipient.award.id || null,
          options: { selections: updatedOptions },
          status: this.recipient.award.status,
        }
      })
    }
  },
  mounted() {
    this.updateSelection()
  }
}
</script>
