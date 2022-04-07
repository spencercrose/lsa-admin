<template>
  <b-container fluid>
      <b-card
        header-tag="header"
        bg-variant="light"
        header-class="font-weight-bold"
        class="mb-3"
      >
        <template #header>
          Confirmations <b-badge v-if="!!recipient.is_declared" variant="success" show>Completed</b-badge>
        </template>
        <b-form-group
          id="fieldset-declarations-is-declared"
          label="Declare Registration as Completed"
          label-size="md"
          label-class="font-weight-bold"
          label-for="input-declarations-is-declared"
          class="mb-4"
        >
          <b-form-checkbox
            id="input-declarations-is-declared"
            v-model="recipient.is_declared"
            :value="1"
            :unchecked-value="0"
            :state="!!recipient.is_declared"
            @change="updateValidation()"
          >Confirm this Registration</b-form-checkbox>
          <b-form-invalid-feedback :state="!!recipient.is_declared">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="fieldset-milestone-bcgeu"
          label-size="md"
          label-class="font-weight-bold"
          label-for="input-milestone-bcgeu"
          class="mb-4"
        >
          <b-form-checkbox
            id="input-milestone-bcgeu"
            v-model="recipient.is_bcgeu_member"
            :value="1"
            :unchecked-value="0"
          >Confirm BCGEU Membership</b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="fieldset-declarations-ceremony-opt-out"
          label-size="md"
          label-for="input-declarations-ceremony-opt-out"
          v-slot="{ ariaDescribedby }"
          class="mb-4"
        >
          <b-form-checkbox
            id="input-declarations-ceremony-opt-out"
            v-model="recipient.ceremony_opt_out"
            :value="1"
            :unchecked-value="0"
            :aria-describedby="ariaDescribedby"
          >Recipient would like award only and to opt out of attending the ceremony</b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="fieldset-declarations-survey-participation"
          label-size="md"
          label-for="input-declarations-survey-participation"
          class="mb-4"
        >
          <b-form-checkbox
            id="input-declarations-survey-participation"
            v-model="recipient.survey_participation"
            :value="1"
            :unchecked-value="0"
          >Confirm recipient participation in LSA survey</b-form-checkbox>
        </b-form-group>

      </b-card>

  </b-container>
</template>

<script>

export default {
  name: "input-confirmations",
  methods: {
    updateValidation() {
      this.$store.commit('setFormValidation', {confirmations: !!this.recipient.is_declared})
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    }
  },
  mounted() {
    // update validation
    this.updateValidation()
  }
};
</script>
