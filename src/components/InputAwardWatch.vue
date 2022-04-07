<template>
  <b-card
    header-tag="header"
    bg-variant="light"
    header-class="font-weight-bold"
    class="mb-3"
  >
    <template #header>
      Award Options: Watch
      <b-badge v-if="validate()" variant="success" show>Completed</b-badge>
    </template>

    <b-form-group
      id="input-group-award-options-watch-faces"
      label="Choose the watch face type"
      label-class="font-weight-bold"
      label-for="input-award-options-watch-faces"
      class="mb-4"
    >
      <b-form-select
        id="input-award-options-watch-faces"
        v-model="selected.faces"
        :options="awardOptions('faces')"
        :state="!!selected.faces"
        :disabled="disabled.faces"
        @change="updateSelection()"
      >
      </b-form-select>
      <b-form-invalid-feedback :state="!!selected.faces">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-watch-sizes"
      label="Choose the watch size"
      label-class="font-weight-bold"
      label-for="input-award-options-watch-sizes"
      class="mb-4"
    >
      <b-form-select
        id="input-award-options-watch-sizes"
        v-model="selected.sizes"
        :options="awardOptions('sizes')"
        :state="!!selected.sizes"
        :disabled="disabled.sizes"
        @change="updateSelection('sizes')"
      >
      </b-form-select>
      <b-form-invalid-feedback :state="!!selected.sizes">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-options-watch-straps"
      label="Choose the watch strap type"
      label-class="font-weight-bold"
      label-for="input-award-options-watch-strap"
      class="mb-4"
    >
      <b-form-select
        id="input-award-options-watch-strap"
        v-model="selected.straps"
        :options="awardOptions('straps')"
        :state="!!selected.straps"
        :disabled="disabled.straps"
        @change="updateSelection()"
      >
      </b-form-select>
      <b-form-invalid-feedback :state="!!selected.straps">
        This field is required.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group
      id="input-group-award-option-engraving"
      label="Enter Engraved Message"
      label-for="input-award-options-engraving"
      :description="`Character Limit: ${engravingCharLimit}`"
    >
      <b-form-input
        id="input-award-options-engraving"
        v-model="selected.engraving"
        placeholder="Enter the engraving"
        :disabled="disabled.engraving"
        :formatter="limitCharLength"
        @change="updateSelection()"
      />
      <b-form-valid-feedback :state="!!selected.engraving">
        Inscription: <b>"</b>{{selected.engraving}}<b>"</b>
      </b-form-valid-feedback>
    </b-form-group>

  </b-card>

</template>

<script>


import {validateAwardOptions} from "@/services/validation.services";
import optionServices from "@/services/options.services";

export default {
  name: "input-award-options-watch",
  data: function () {
    return {
      disabled: {
        faces: false,
        sizes: false,
        straps: true,
        engraving: false
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
      let filteredOptions = {
          faces: null,
          sizes: null,
          straps: null,
          engraving: null
        }
      // convert array of options to indexed object
      selections.forEach(option => {
        filteredOptions[option.key] = option.value
      })
      return filteredOptions
    },
    engravingCharLimit() {
      let size = ''
      const { selections = [] } = this.recipient.award.options || {}
      selections.forEach(option => {
        if (String(option.key) === 'sizes') size = option.value
      })
      return optionServices.getEngravingCharLimit(size)
    },
    validate(){
      return () => {
        return validateAwardOptions('watch', null, this.recipient.award)
      }
    },
    awardOptions() {
      return (type) => {
        // get the current award selection
        const {id = null} = this.recipient.award || {}

        // init available options for this award
        let availableOptions = optionServices.getAwardOptions(id, this.$store.getters.getAwards)

        // reject null award options in available options
        if (!availableOptions) return []

        // pick select options based on type
        const options = availableOptions.filter(opts => opts.key === type)
        return options.length > 0 ? options[0].options : []
      }
    }
  },
  methods: {
    updateSelection(type) {
      // Two-toned watch face only comes with a plated strap
      if (this.selected.faces === 'two-toned') {
        this.selected.straps = 'plated'
        this.disabled.straps = true
      } else {
        this.disabled.straps = false
      }
      const updatedOptions = Object.keys(this.selected || {}).map(key => {

        // reset engraving string on size change
        if (type === 'sizes') this.selected.engraving = ''

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
    },
    limitCharLength(str) {
      // restrict character length of engraving
      return String(str).substring(0, this.engravingCharLimit);
    }
  },
  mounted() {
    this.updateSelection()
  }
}
</script>
