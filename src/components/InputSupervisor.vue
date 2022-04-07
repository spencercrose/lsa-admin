<template>
  <b-container fluid>
      <b-card
        header-tag="header"
        header-class="font-weight-bold"
        bg-variant="light"
        class="mb-3 mt-3"
      >
        <template #header>
          Supervisor Contact Details <b-badge v-if="validate('all')" variant="success" show>Completed</b-badge>
        </template>

        <b-form-group
          id="fieldset-supervisor-firstName"
          label="Supervisor's First Name"
          label-for="input-supervisor-firstName"
        >
          <b-form-input
            id="input-supervisor-firstName"
            v-model="recipient.supervisor_first_name"
            placeholder="Enter supervisor's first name"
            :state="validate('first_name')"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('first_name')">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group>
          <b-form-group
            id="fieldset-supervisor-lastName"
            label="Supervisor's Last Name"
            label-for="input-supervisor-lastName"
          >
            <b-form-input
              id="input-supervisor-lastName"
              v-model="recipient.supervisor_last_name"
              placeholder="Enter supervisor's last name"
              :state="validate('last_name')"
              @update="updateValidation()"
            />
            <b-form-invalid-feedback :state="validate('last_name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="fieldset-supervisor-email"
            label="Supervisor's Contact Email"
            label-for="input-supervisor-email"
          >
            <b-form-input
              id="input-supervisor-email"
              v-model="recipient.supervisor_email"
              placeholder="Supervisor's employee email address"
              :state="validate('email')"
              @update="updateValidation()"
            />
            <b-form-invalid-feedback :state="validate('email')">
              Enter a valid email address.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form-group>
      </b-card>

      <Address
        id="supervisor_address"
        header="Supervisor Address"
        label="Supervisor"
        :pobox="true"
        :required="true"
      />

  </b-container>
</template>

<script>

import Address from '@/components/InputAddress'
import {validateEmail, validateText} from "@/services/validation.services";

export default {
  name: "input-supervisor-contact",
  components: {
    Address
  },
  methods: {
    updateValidation() {
      this.$store.commit('setFormValidation', {supervisor_contact: this.validate('all')})
    }
  },
  computed: {
    recipient() {
        return this.$store.getters.getFormData;
    },
    validate(){
      return (field) => {
        const fields = {
          first_name: ()=>{
            return validateText(this.recipient.supervisor_first_name)
          },
          last_name: ()=>{
            return validateText(this.recipient.supervisor_last_name)
          },
          email: ()=>{
            return validateEmail(this.recipient.supervisor_email)
          }
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
