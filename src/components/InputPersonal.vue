<template>
  <b-container fluid>
      <b-card
        header-tag="header"
        header-class="font-weight-bold"
        bg-variant="light"
        class="mb-3 mt-3"
      >

        <template #header>
          Personal Contact Details <b-badge v-if="hasData && validate('all')" variant="success" show>Completed</b-badge>
        </template>

        <b-form-group
          id="fieldset-personal-email"
          label="Personal Email"
          label-for="input-personal-email"
        >
          <b-form-input
            id="input-personal-email"
            v-model="recipient.personal_email"
            placeholder="Recipient's email address"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('email')">
            Enter a valid email address. This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="fieldset-personal-phone"
          label="Personal Phone Number"
          label-for="input-personal-phone"
        >
          <b-form-input
            id="input-personal-phone"
            v-model="recipient.personal_phone_number"
            placeholder="###-###-####"
            @update="updateValidation()"
          >
          </b-form-input>
          <b-form-invalid-feedback :state="validate('personal_phone_number')">
            Enter a valid phone number (###-###-####)
          </b-form-invalid-feedback>
        </b-form-group>

      </b-card>

      <Address
        id="personal_address"
        header="Personal Address"
        label="Personal"
      />

  </b-container>
</template>

<script>

import Address from '@/components/InputAddress'
import {validateEmail, validatePhone} from "@/services/validation.services";

export default {
  name: "input-personal-contact",
  components: {
    Address
  },
  methods: {
    updateValidation() {
      if (this.isRequired) {
        this.$store.commit('setFormValidation', {personal_contact: this.validate('all')})
      }
    }
  },
  computed: {
    recipient() {
        return this.$store.getters.getFormData;
    },
    hasData() {
      return !!this.recipient.personal_email || !!this.recipient.personal_phone_number
    },
    validate(){
      return (field) => {
        const fields = {
          email: ()=>{
            return !this.recipient.personal_email || validateEmail(this.recipient.personal_email)
          },
          personal_phone_number: ()=>{
            return !this.recipient.personal_phone_number || validatePhone(this.recipient.personal_phone_number)
          },
        }
        if (fields[field] === 'undefined') return false;
        // check if all fields validate
        if (field === 'all') return Object.keys(fields).filter(key => {
          return !fields[key]()
        }).length === 0;
        return !!fields[field]();
      }
    }
  },
  mounted() {
    // update validation
    this.updateValidation()
  }
};
</script>
