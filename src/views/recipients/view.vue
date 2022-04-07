<template>
    <b-container fluid>
      <PageHeader :header="this.header" :lead="this.lead" />
      <b-alert v-if="error" variant="danger" show>{{error}}</b-alert>
      <b-container v-if="!isLoading">
        <b-row align="right">
          <b-col>
            <b-button size="sm" variant="info" class="m-1" @click="reroute(`/recipients/edit/${recipient.id}`)">
              Edit
            </b-button>
            <b-button size="sm" variant="danger" class="m-1" @click="reroute(`/recipients/delete/${recipient.id}`)">
              Delete
            </b-button>
          </b-col>
        </b-row>
        <b-card
          header="Recipient Record"
          header-tag="header"
          bg-variant="light"
          header-class="font-weight-bold"
          class="mb-3"
        >
          <b-alert v-if="isHistoricalRecipient" show variant="info">
            This recipient has previously selected an award.
          </b-alert>
          <b-container class="p-3">
            <b-row>
              <b-col cols="3">
                <h5>Administrative</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key: 'historical', label: 'Historical Recipient'},
                    {key: 'historical_milestone', label: 'Historical Milestone'},
                    {key: 'historical_milestone_year', label: 'Historical Qualifying Year'},
                    {key: 'admin_notes', label: 'Admin Notes'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(historical)="cell">
                    {{ cell.item.historical ? 'Yes' : 'No' }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <h5>Identification</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key: 'first_name', label: 'First Name'},
                    {key: 'last_name', label: 'Last Name'},
                    {key: 'employee_number', label: 'Employee Number'},
                    {key: 'government_email', label: 'Government Email'},
                    {key: 'government_phone_number', label: 'Government Phone'},
                    {key: 'organization_id', label: 'Ministry/Organization'},
                    {key: 'branch_name', label: 'Branch'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(organization_id)="cell">
                    {{ lookupOrganization(cell.item.organization_id) }}
                  </template>
                  <template #cell(government_phone_number)="cell">
                    {{ formatPhoneNumber(cell.item.government_phone_number) }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="recipient.office_address">
              <b-col cols="3">
                <h5>Office Address</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient.office_address]"
                  :fields="[
                    {key:'prefix', label:'Address Prefix'},
                    {key:'street_address', label:'Street Address'},
                    {key:'community', label:'City or Community'},
                    {key:'postal_code', label:'Postal Code'}
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                </b-table>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <h5>Personal Contact Info</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key:'personal_email', label:'Email'},
                    {key: 'personal_phone_number', label:'Phone'},
                   ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(personal_phone_number)="cell">
                    {{ formatPhoneNumber(cell.item.personal_phone_number) }}
                  </template>
                </b-table>
                <b-table
                  v-if="recipient.personal_address"
                  stacked
                  :items="[recipient.personal_address]"
                  :fields="[
                    {key:'prefix', label:'Address Prefix'},
                    {key:'street_address', label:'Street Address'},
                    {key:'community', label:'Community'},
                    {key:'postal_code', label:'Postal Code'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                </b-table>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <h5>Milestone</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key: 'milestones', label: 'Milestone'},
                    {key: 'qualifying_year', label: 'Qualifying Year'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(selected)="cell">
                    {{ lookup('milestones', cell.item.milestones) }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="recipient.retiring_this_year">
              <b-col cols="3">
                <h5>Retirement</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key: 'retirement_date', label: 'Retirement Date'}
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="recipient.award.id && awards">
              <b-col cols="3">
                <h5>Award</h5>
              </b-col>
              <b-col>
                <b-table
                  v-if="lookupAward(recipient.award.id)"
                  stacked
                  :items="[lookupAward(recipient.award.id)]"
                  :fields="[
                    {key: 'name', label: 'Award Name'},
                    {key: 'description', label: 'Description'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(description)="cell">
                    <p v-for="(paragraph, index) in parseDescription(cell.item.description)" v-bind:key="index">
                      {{paragraph}}
                    </p>
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-else>
              <b-col cols="3">
                <h5>Award</h5>
              </b-col>
              <b-col>
                <b-alert show variant="warning">No award selected during registration.</b-alert>
                <b-alert v-if="isHistoricalRecipient" show variant="info">
                  This recipient has selected an award during a previous year.
                </b-alert>
              </b-col>
            </b-row>
            <b-row v-if="recipient.award.options">
              <b-col cols="3">
                <h5>Award Options</h5>
              </b-col>
              <b-col>
                <b-table
                  v-for="(selection, index) in recipient.award.options.selections || []"
                  v-bind:key="index"
                  stacked
                  :fields="[
                      {key: 'value', label: lookup('award-option-types', selection.key)},
                     ]"
                  :items="[selection]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(value)="cell">
                    {{ lookupAwardOption(cell.item.key, cell.item.value) }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
            <b-row v-if="recipient.supervisor_address">
              <b-col cols="3">
                <h5>Service Pin (Supervisor Contact Info)</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key:'supervisor_first_name', label:'First Name'},
                    {key:'supervisor_last_name', label:'Last Name'},
                    {key:'supervisor_email', label:'Email'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                </b-table>
                <b-table
                  stacked
                  :items="[recipient.supervisor_address]"
                  :fields="[
                    {key:'pobox', label:'P.O. Box'},
                    {key:'prefix', label:'Address Prefix'},
                    {key:'street_address', label:'Street Address'},
                    {key:'community', label:'Community'},
                    {key:'postal_code', label:'Postal Code'},
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                </b-table>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="3">
                <h5>Confirmations</h5>
              </b-col>
              <b-col>
                <b-table
                  stacked
                  :items="[recipient]"
                  :fields="[
                    {key:'is_declared', label:'Has confirmed registration'},
                    {key:'ceremony_opt_out', label:'To attend the Awards Ceremony'},
                    {key:'survey_participation', label:'To participate in the LSA survey'},
                    {key: 'is_bcgeu_member', label: 'BCGEU Member'}
                    ]"
                  striped
                  responsive="sm"
                  primary-key="id"
                >
                  <template #cell(ceremony_opt_out)="cell">
                    {{ cell.item.ceremony_opt_out ? 'No' : 'Yes' }}
                  </template>
                  <template #cell(is_bcgeu_member)="cell">
                    {{ cell.item.is_bcgeu_member ? 'Yes' : 'No' }}
                  </template>
                  <template #cell(survey_participation)="cell">
                    {{ cell.item.survey_participation ? 'Yes' : 'No' }}
                  </template>
                  <template #cell(is_declared)="cell">
                    {{ cell.item.is_declared ? 'Yes' : 'No' }}
                  </template>
                </b-table>
              </b-col>
            </b-row>

          </b-container>
        </b-card>
      </b-container>
    </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import optionServices from '@/services/options.services'
import {getRecipient} from "@/services/api.services";

export default {
  name: "recipients-view",
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data () {
    return {
      recipient: null,
      error: ''
    }
  },
  methods: {
    lookup(key, value) {
      return optionServices.lookup(key, value)
    },
    lookupOrganization(value) {
      return optionServices.lookup('organizations', parseInt(value), {organizations: this.organizations})
    },
    lookupAward(value) {
      return optionServices.getAwardDetails(parseInt(value), this.awards)
    },
    lookupAwardOption(key, value) {

      // get the current award selection + selected options
      const awards = this.$store.getters.getAwards
      const pecsfOptions = this.$store.getters.getPecsfOptions
      const { id=null } = this.recipient.award || {}
      const awardOptions = optionServices.getAwardOptions(id, awards)
      const selectedOptions = (awardOptions || []).filter(awardOption => String(key) === String(awardOption.key)) || null
      if (selectedOptions.length > 0) {
        if (key === 'engraving') {
          return value
        }
        if (key === 'certificate') {
          return value
        }
        return optionServices.lookup('options', value, selectedOptions[0] || [])
      }
      else {
        // PECSF options
        if (key === 'pecsfPool') {
          return value ? 'Yes' : 'No'
        }
        if (key === 'honour') {
          return value || 'None'
        }
        if (!value) return 'n/a'
        return optionServices.lookup('regions', parseInt(value), pecsfOptions)
          || optionServices.lookup('charities', parseInt(value), pecsfOptions)
      }
    },
    formatPhoneNumber(value) {
      return optionServices.formatPhoneNumber(value)
    },
    parseDescription: function(description) {
      return description.split(/(\\r)*\\n/g)
    },
    async reroute(uri) {
      await this.$router.push(uri)
    }
  },
  computed: {
    organizations() {
      return this.$store.getters.getOrganizations || []
    },
    awards() {
      return this.$store.getters.getAwards || []
    },
    isLoading() {
      return this.$store.getters.isLoading || !this.recipient
    },
    isHistoricalRecipient() {
      const {historical=false} = this.recipient || {}
      return historical
    }
  },
  async beforeCreate () {
    this.$store.commit('setLoading', true)
    const { id=null } = this.$route.params || {}
    // load recipient data
    const [error, data] = await getRecipient(id)
    if (error) {
      this.$store.commit('setMessage', error)
      this.error = error.text
    }
    else {
      // put API result into local data
      this.recipient = data || {}
      // load awards for given milestone year
      await this.$store.dispatch('loadAwards', this.recipient.milestones)
    }
    this.$store.commit('setLoading', false)
  }
}
</script>
