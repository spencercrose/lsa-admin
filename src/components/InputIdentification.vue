<template>
  <b-container fluid>
    <b-card
      header-tag="header"
      header-class="font-weight-bold"
      bg-variant="light"
      class="mb-3 mt-3"
    >
      <template #header>
        Profile Details <b-badge v-if="validate('all')" variant="success" show>Completed</b-badge>
      </template>

      <b-form-group>
        <b-form-group
          id="fieldset-recipient-firstName"
          label="First Name"
          label-for="input-recipient-firstName"
        >
          <b-form-input
            id="input-recipient-firstName"
            v-model="recipient.first_name"
            placeholder="Recipient's first name"
            :state="validate('first_name')"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('first_name')">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group>
          <b-form-group
            id="fieldset-recipient-lastName"
            label="Last Name"
            label-for="input-recipient-lastName"
          >
            <b-form-input
              id="input-recipient-lastName"
              v-model="recipient.last_name"
              placeholder="Recipient's last name"
              :state="validate('last_name')"
              @update="updateValidation()"
            />
            <b-form-invalid-feedback :state="validate('last_name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form-group>

        <b-form-group
          id="fieldset-recipient-employee-number"
          label="Employee Number"
          label-for="input-recipient-employee-number"
        >
          <b-form-input
            id="input-recipient-employee-number"
            v-model="recipient.employee_number"
            placeholder="Recipient's employee number"
            :state="validate('employee_number')"
            @change="checkEmployeeNumber()"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('employee_number')">
            This field is required.
          </b-form-invalid-feedback>
          <b-alert v-if="isHistoricalRecipient" show variant="info">
            This recipient has previously selected an award.
          </b-alert>
        </b-form-group>

        <b-form-group
          id="fieldset-recipient-email"
          label="Government Email"
          label-for="input-recipient-email"
        >
          <b-form-input
            id="input-recipient-email"
            v-model="recipient.government_email"
            placeholder="Recipient's employee email address"
            :state="validate('government_email')"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('government_email')">
            Enter a valid email address.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="fieldset-recipient-government-phone"
          label="Government Phone Number"
          label-for="input-recipient-government-phone"
          description="Optional"
        >
          <b-form-input
            id="input-recipient-government-phone"
            v-model="recipient.government_phone_number"
            placeholder="###-###-####"
            @update="updateValidation()"
          >
          </b-form-input>
          <b-form-invalid-feedback :state="validate('government_phone_number')">
            Enter a valid phone number (###-###-####)
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="input-group-organization"
          label="Government Ministry"
          label-for="input-organization"
        >
          <b-form-select
            id="input-organization"
            v-model="recipient.organization_id"
            :options="organizations"
            :state="validate('organization_id')"
            @update="updateValidation()"
          >
          </b-form-select>
          <b-form-invalid-feedback :state="validate('organization_id')">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="fieldset-recipient-branch"
          label="Branch (Please fill out in full)"
          label-for="input-recipient-branch"
        >
          <b-form-input
            id="input-recipient-branch"
            v-model="recipient.branch_name"
            placeholder="Recipient's ministry branch"
            :state="validate('branch_name')"
            @update="updateValidation()"
          />
          <b-form-invalid-feedback :state="validate('branch_name')">
            This field is required.
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form-group>
    </b-card>

    <Address id="office_address" header="Office Address" label="Office" :required="true"  />

  </b-container>
</template>

<script>

import Address from '@/components/InputAddress'
import {validateEmail, validatePhone, validateText} from "@/services/validation.services";
import {hasRegistered} from "../services/api.services";

export default {
  name: "input-identification",

  components: {
    Address
  },
  methods: {
    async checkEmployeeNumber() {

      // filter out any leading zeros in the employee number
      // - uses unary operator to convert string to number
      let filteredEmployeeNumber = +this.recipient.employee_number;
      filteredEmployeeNumber = isNaN(filteredEmployeeNumber)
        ? this.recipient.employee_number
        : String(filteredEmployeeNumber)

      // update employee number in state
      // - do not allow zero
      this.recipient.employee_number = filteredEmployeeNumber !== 0 && filteredEmployeeNumber !== '0'
        ? filteredEmployeeNumber
        : ''

      // ignore empty numbers
      if (!this.recipient.employee_number) return

      // check if recipient is already registered
      const [error, existingID] = await hasRegistered(filteredEmployeeNumber)
      const {id=''} = existingID || {}

      if (!error && id !== this.recipient.id) {
        this.$store.commit('setMessage', {
          text: `Registration already exists for this employee number.`,
          type: 'warning',
        })
        // reset employee number
        this.recipient.employee_number = ''
      }
      else {
        await this.$store.dispatch('isHistoricalRecipient', this.recipient.employee_number)
        // reset award data if historical recipient
        if (this.isHistoricalRecipient) {
          this.$store.commit('setFormData', {milestones: null, award: {}})
          this.$store.commit('setFormValidation', {
            award: true, award_options: true, milestone: true})
        }
      }
    },
    updateValidation() {
      this.$store.commit('setFormValidation', {identification: this.validate('all')})
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    },
    organizations() {
      const orgList = this.$store.getters.getOrganizations || []
      const user = this.$store.getters.getUser || {}
      // filter organizations by associations (if current user is org contact)
      return user && user.role === 'orgContact' ? orgList.filter(org => {
        return user.organizations.includes(org.value)
      }) : orgList
    },
    communities() {
      return this.$store.getters.getCommunities
    },
    validate(){
      return (field) => {
        const fields = {
          first_name: ()=>{
            return validateText(this.recipient.first_name)
          },
          last_name: ()=>{
            return validateText(this.recipient.first_name)
          },
          employee_number: ()=>{
            return validateText(this.recipient.employee_number)
          },
          government_email: ()=>{
            return validateEmail(this.recipient.government_email)
          },
          government_phone_number: ()=>{
            return !this.recipient.government_phone_number
              || validatePhone(this.recipient.government_phone_number)
          },
          organization_id: ()=>{
            return !!this.recipient.organization_id
          },
          branch_name: ()=>{
            return !!this.recipient.branch_name
          }
        }
        // check if all fields validate
        // - store validation of section
        if (field === 'all') return Object.keys(fields).filter(key => {
          return !fields[key]()
        }).length === 0

        if (fields[field] === 'undefined') return false
        return !!fields[field]();
      }
    },
    isSubmitted() {
      return this.$store.getters.isSubmitted
    },
    isHistoricalRecipient() {
      return this.$store.getters.getFormData.historical
    }
  },
  async beforeMount() {
    // check if historical recipient
    const {employee_number=null} = this.$store.getters.getFormData
    await this.$store.dispatch('isHistoricalRecipient', employee_number)
  },
  mounted() {
    // update validation
    this.updateValidation()
  }
};
</script>
