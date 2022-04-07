<template>
  <b-card
    header-tag="header"
    header-class="font-weight-bold"
    bg-variant="light"
    class="mb-3 mt-3"
  >
    <template #header>
      {{header}}
      <b-badge class="mr-2" v-if="!isRequired" variant="info" show>Optional</b-badge>
      <b-badge v-if="hasData && validate('all')" variant="success" show>Completed</b-badge>
    </template>

    <b-form-group>
      <b-form-group
        v-if="pobox"
        :id="`fieldset-${id}-address-pobox`"
        label="P.O. Box"
        :label-for="`input-${id}-address-pobox`"
        description="Required for Victoria addresses"
      >
        <b-form-input
          prepend="P.O. Box"
          :id="`input-${id}-address-pobox`"
          v-model="address.pobox"
          placeholder="P.O. Box number"
        />
      </b-form-group>

      <b-form-group
        :id="`fieldset-${id}-address-prefix`"
        label="Address Prefix"
        :label-for="`input-${id}-address-prefix`"
        description="Optional"
      >
        <b-form-input
          :id="`input-${id}-address-prefix`"
          v-model="address.prefix"
          placeholder="Address prefix"
        />
      </b-form-group>

      <b-form-group
        :id="`fieldset-${id}-address-street-address`"
        label="Street Address"
        :label-for="`input-${id}-address-street-address`"
      >
        <b-form-input
          :id="`input-${id}-address-street-address`"
          v-model="address.street_address"
          :placeholder="`${label} street address`"
          :state="isRequired ? validate('street_address') : null"
          @change="updateValidation()"
        />
        <b-form-invalid-feedback :state="validate('street_address')">
          This field is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group
        :id="`fieldset-${id}-address-postalcode`"
        label="Postal Code"
        :label-for="`input-${id}-address-postalcode`"
      >
        <b-form-input
          :id="`input-${id}-address-postalcode`"
          v-model="address.postal_code"
          placeholder="A0A 0A0"
          :state="isRequired ? validate('postal_code') : null"
          @update="updateValidation()"
        />
        <b-form-invalid-feedback :state="validate('postal_code')">
          Enter a valid Canadian postal code.
          <span v-if="isRequired"> This field is required.</span>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group
        :id="`fieldset-${id}-address-community`"
        label="City or Community"
        :label-for="`input-${id}-address-community`"
      >
        <b-form-input
          :id="`input-${id}-address-community`"
          v-model="address.community"
          placeholder="Address's city or community"
          list="community-list"
          :state="isRequired ? validate('community') : null"
          @change="updateValidation()"
        />
        <datalist id="community-list">
          <option v-for="(community, index) in communities" v-bind:key="index">
            {{ community.text }}
          </option>
        </datalist>
        <b-form-invalid-feedback :state="validate('community')">
          This field is required.
        </b-form-invalid-feedback>
      </b-form-group>
    </b-form-group>
  </b-card>
</template>

<script>

import {validateText, validatePostcode} from "@/services/validation.services";

export default {
  name: "fieldset-address",
  props: {
    id: String,
    header: String,
    label: String,
    pobox: Boolean
  },
  methods: {
    updateValidation() {
      if (this.isRequired) this.$store.commit('setFormValidation', {[this.id]: this.validate('all')})
      else this.$store.commit('setFormValidation', {[this.id]: true})
    }
  },
  computed: {
    recipient() {
      return this.$store.getters.getFormData
    },
    address() {
      return this.recipient[this.id] ? this.recipient[this.id] : {}
    },
    organizations() {
      return this.$store.getters.getOrganizations
    },
    communities() {
      return this.$store.getters.getCommunities
    },
    isLoading() {
      return this.$store.getters.isLoading
    },
    isRequired() {
      // conditional requirement for personal address info
      return this.id !== 'personal_address' || (
        this.id === 'personal_address'
        && (!!this.recipient.retiring_this_year || !!this.recipient.ceremony_opt_out)
      )
    },
    hasData() {
      return !!this.address.pobox
        || !!this.address.prefix
        || !!this.address.postal_code
        || !!this.address.street_address
        || !!this.address.community
    },
    validate() {
      return (field) => {
        const fields = {
          street_address: () => {
            return this.isRequired
              ? validateText(this.address.street_address)
              : !this.hasData || validateText(this.address.street_address)
          },
          postal_code: () => {
            return this.isRequired
              ? validatePostcode(this.address.postal_code)
              : !this.hasData || validatePostcode(this.address.postal_code)
          },
          community: () => {
            return this.isRequired
              ? validateText(this.address.community)
              : !this.hasData || validateText(this.address.community)
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
    this.updateValidation()
  }
};

</script>
