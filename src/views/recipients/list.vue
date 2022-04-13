<template>
  <b-container fluid>
    <PageHeader :header="header" :lead="lead" />

    <ModalAction
      :title="lookup('recipientActions', selectAction)"
      :action="selectAction"
      :process="selectedActionProcess"
      :options="ceremonies"
    />

    <b-container fluid v-if="!isLoading && isSuperAdmin" class="p-2 rounded bg-secondary text-white">
      <b-row>
        <b-col cols="4">
            <b-form-select
              id="table-select-action"
              v-model="selectAction"
              :options="actions"
            ></b-form-select>
        </b-col>
        <b-col>
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="info"
            v-b-modal.modal-action
            :disabled="processing || processingAction || !hasAction || !hasSelected"
            @click="applyAction"
          >
            Apply Action
          </b-button>
        </b-col>
        <b-col cols="6" align="right">
          <span v-if="selected.length > 0"> {{ selected.length }} Item(s) Selected</span>
          <b-spinner v-if="processingAction" class="mr-3" small />
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="dark"
            :disabled="processing || processingAction || !hasSelected"
            @click="selectAllRows">
            Select All
          </b-button>
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="dark"
            :disabled="processing || processingAction || !hasSelected"
            @click="clearSelected">
            Clear Selected
          </b-button>
        </b-col>
      </b-row>
    </b-container>

    <FilterRecipientList :loader="loadRecipients" />

    <b-table
      id="recipients-table"
      ref="selectableTable"
      :items="items"
      small
      :fields="fields"
      striped
      :select-mode="selectMode"
      responsive="sm"
      :selectable="isSuperAdmin"
      @row-selected="onRowSelected"
      :busy.sync="loading"
    >
      <!-- scoped slot for select state -->
      <template #cell(selected)="{ rowSelected }">
        <template v-if="rowSelected">
          <div class="text-center" aria-hidden="true"><BIconCheckSquare/></div>
          <span class="sr-only">Selected</span>
        </template>
        <template v-else>
          <span aria-hidden="true">&nbsp;</span>
          <span class="sr-only">Not selected</span>
        </template>
      </template>

      <template #cell(is_declared)="row">
        <b-badge class="m-1" :variant="!!row.item.is_declared ? 'success' : 'warning'">
          {{ !!row.item.is_declared ? 'Submitted' : 'Draft' }}
        </b-badge>
        <b-badge class="p-1" v-if="!!row.item.historical" variant="info">Historical</b-badge>
      </template>

      <template #cell(organization)="row">
        {{ lookupOrganization(row.item.organization) }}
      </template>

      <template #cell(retiring_this_year)="row">
        {{ row.item.retiring_this_year ? 'Yes' : 'No' }}
      </template>

      <template #cell(ceremony_opt_out)="row">
        {{ row.item.ceremony_opt_out ? 'Yes' : 'No' }}
      </template>

      <template #cell(created)="row">
        {{ row.item.created.toLocaleString() }}
      </template>

      <template #cell(updated)="row">
        {{ row.item.updated.toLocaleString() }}
      </template>

      <template #cell(details)="row">
        <b-button-group>
          <b-button
            size="sm"
            class="m-1"
            @click="reroute(`/recipients/view/${row.item.id}`)"
          >
            View
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            @click="reroute(`/recipients/edit/${row.item.id}`)"
          >
            Edit
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            @click="reroute(`/recipients/delete/${row.item.id}`)"
          >
            Delete
          </b-button>
        </b-button-group>
      </template>

    </b-table>

    <b-alert v-if="error" show variant="danger">
      A server error occurred. Please contact the site administrator for assistance.
    </b-alert>

  </b-container>
</template>

<script>

import FilterRecipientList from "../../components/FilterRecipientList"
import PageHeader from '@/components/PageHeader'
import ModalAction from '@/components/ModalAction'
import {BIconCheckSquare} from 'bootstrap-vue'
import {getRecipients} from "@/services/api.services"
import optionsServices from '@/services/options.services'
import {put} from "../../services/api.services";

export default {
  name: 'recipients-list',
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader,
    ModalAction,
    FilterRecipientList,
    BIconCheckSquare
  },
  data () {
    return {
      loading: false,
      processing: false,
      processingAction: false,
      error: false,
      message: '',
      current_page: 0,
      first_page_url: '',
      last_page_url: '',
      last_page: '',
      links: [],
      next_page_url: '',
      path: '',
      per_page: 0,
      prev_page_url: '',
      from: 0,
      to: 0,
      total: 0,
      modes: ['multi', 'single', 'range'],
      selectMode: 'multi',
      selected: [],
      selectAction: '',
      actions: optionsServices.get('recipientActions'),
      selectedActionProcess: null,
      items: [],
      fields: [
        {key: 'is_declared', label: 'Status'},
        {key: 'first_name'},
        {key: 'last_name'},
        {key: 'employee_number', label: 'Employee No.'},
        {key: 'organization'},
        {key: 'branch_name', label: 'Branch'},
        {key: 'milestone'},
        {key: 'retiring_this_year', label: 'Retiring'},
        {key: 'ceremony_opt_out', label: 'Opt Out'},
        {key: 'updated'},
        {key: 'created'},
        {key: 'details', label: ''}
      ]
    }
  },
  computed: {
    isLoading () {
      return this.$store.getters.isLoading
    },
    isOrgContact () {
      return this.$store.getters.isOrgContact
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isSuperAdmin () {
      return this.$store.getters.isSuperAdmin
    },
    user() {
      return this.$store.getters.getUser
    },
    ceremonies() {
      return this.$store.getters.getCeremonies
    },
    organizations() {
      // filter organizations by recipient authorization
      const orgs = this.$store.getters.getOrganizations
      return this.user.role === 'orgContact'
        ? orgs.filter(org => {
          return (this.user.organizations || []).includes(org.value) || !org.value
        })
        : orgs
    },
    hasAction() {
      return !!this.selectAction
    },
    hasSelected() {
      return this.selected.length > 0
    },
  },
  methods: {
    onRowSelected(items) {
      this.selected = items
    },
    selectAllRows() {
      this.$refs.selectableTable.selectAllRows()
    },
    clearSelected() {
      this.$refs.selectableTable.clearSelected()
    },
    applyAction() {
      const process = async (url, data)=> {
        this.processingAction = true
        const [error,] = await put(url, data)
        if (error) this.$store.commit('setMessage', {
          text: 'An error occurred. Your action could not be completed',
          type: 'danger'
        })
        else {
          // successful action
          this.$store.commit('setMessage', {
            text: `Recipient(s) successfully ${data.status.toUpperCase()}`, type: 'success'
          })
          // reload data and close modal
          await this.loadRecipients()
        }
        this.processingAction = false
      }

      // Status Options : 'assigned','invited','attending','declined','waitlisted'
      const actions = {
        assign: (ceremony) => {
          console.log('Assign ceremony:', this.selected, ceremony)
          this.selected.forEach(recipient => {
            const {id = ''} = recipient || {}
            process(`/recipients/assign/${id}'`, {
              status: 'assigned',
              ceremony: ceremony
            })
          })
        },
        waitlist: (ceremony) => {
          console.log('Assign ceremony:', this.selected, ceremony)
          this.selected.forEach(recipient => {
            const {id = ''} = recipient || {}
            process(`/recipients/assign/${id}'`, {
              status: 'waitlisted',
              ceremony: ceremony
            })
          })
        }
      }
      this.selectedActionProcess = actions[this.selectAction]
    },
    async loadRecipients (pageNum, filters=[]) {
      this.processing = true
      this.error = false
      const [error, recipients] = await getRecipients(pageNum, filters)
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }
      // get data and pagination links
      const {
        data=[],
        current_page=0,
        first_page_url='',
        last_page_url='',
        last_page = '',
        links = [],
        next_page_url = '',
        path = '',
        per_page = 0,
        prev_page_url = '',
        from = 0,
        to = 0,
        total = 0,
      } = recipients || {}

      // set pagination
      this.$store.commit('setPagination', {
        current_page: current_page,
        first_page_url: first_page_url,
        last_page_url: last_page_url,
        last_page: last_page,
        links: links,
        next_page_url: next_page_url,
        path: path,
        per_page: per_page,
        prev_page_url: prev_page_url,
        from: from,
        to: to,
        total: total,
      })

      // filter draft for non super-admin users
      this.items = (data || [])
        .filter(recipient => {
          return !!recipient.is_declared || this.isSuperAdmin
        })
        .map(recipient => {
          const {
            id=null,
            first_name=false,
            last_name=null,
            employee_number=null,
            milestones=null,
            historical=false,
            retiring_this_year=0,
            ceremony_opt_out=0,
            organization_id='',
            branch_name='',
            is_declared=0,
            updated_at=null,
            created_at=null,
          } = recipient || {}
          const updatedTS = new Date(updated_at)
          const createdTS = new Date(created_at)
          return {
            id: id,
            is_declared: is_declared,
            first_name: first_name,
            last_name: last_name,
            employee_number: employee_number,
            organization: organization_id,
            historical: historical,
            milestone: milestones,
            branch_name: branch_name,
            retiring_this_year: retiring_this_year,
            ceremony_opt_out: ceremony_opt_out,
            created: createdTS,
            updated: updatedTS,
          }
        })
      this.processing = false
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    lookup(key, value) {
      return optionsServices.lookup(key, value)
    },
    lookupOrganization(value) {
      const org = this.organizations.filter(org => {
        return String(org.value) === String(value)
      })
      if (org.length > 0) {
        const {text = ''} = org[0] || {}
        // return organization shortname
        return text ? text.substring(0, text.lastIndexOf("-")) : '';
      }
      return value
    }
  },
  async beforeMount () {
    this.$store.commit('setLoading', true)
    await this.loadRecipients()
    this.$store.commit('setLoading', false)
  }
}
</script>
