<template>
  <div>
    <b-container fluid v-if="!isLoading" class="mb-2 mt-2 p-2 rounded bg-secondary text-white">
      <b-row>
        <b-col class="pl-3">
          <p><span class="font-weight-bold">Listed Recipients:</span>
            {{pagination.total}}</p>
        </b-col>
        <b-col class="mb-2" align="right">
          <b-spinner v-if="processing" class="mr-3" small />
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="info"
            :disabled="processing"
            @click="applyFilter()">
            Apply Filters</b-button>
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="dark"
            @click="clearFilters"
            :disabled="!hasFilters || processing">
            Clear Filters</b-button>
          <b-button
            class="m-1 border-light font-weight-bold"
            size="sm"
            variant="success"
            @click="reroute('/recipients/create')">Add Recipient</b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col v-if="isAdmin">
          <b-form-group
            label="Status"
            label-for="table-select-filter-declared"
          >
            <b-form-select
              id="table-select-filter-declared"
              v-model="selectStatus"
              :options="statuses"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Historical"
            label-for="table-select-filter-historical"
          >
            <b-form-select
              id="table-select-filter-historical"
              v-model="selectHistorical"
              :options="historical"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Sort By"
            label-for="table-select-filter-sort-by"
          >
            <b-form-select
              id="table-select-filter-sort-by"
              v-model="selectSortBy"
              :options="sortBy"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Sort Order"
            label-for="table-select-filter-sort-order"
          >
            <b-form-select
              id="table-select-filter-sort-order"
              v-model="selectSortOrder"
              :options="sortOrder"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Results Per Page"
            label-for="table-select-filter-results-per-page"
          >
            <b-form-select
              id="table-select-filter-results-per-page"
              v-model="selectResultsPerPage"
              :options="resultsPerPage"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="Recipient Name"
            label-for="table-input-filter-name"
          >
            <b-form-input
              id="table-input-filter-name"
              v-model="selectName"
              placeholder="Search Recipient's First or Last Name"
            />
            <p class="small">Enter the first <span class="font-weight-bold">OR</span> last name.</p>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Employee Number"
            label-for="table-input-filter-employee-number"
          >
            <b-form-input
              id="table-input-filter-employee-number"
              v-model="selectEmployeeNumber"
              placeholder="Search recipient's employee number"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="Milestone" label-for="table-select-filter-milestone">
            <b-form-select
              id="table-select-filter-milestone"
              v-model="selectMilestone"
              :options="milestones"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Organization"
            label-for="table-select-filter-organization"
          >
            <b-form-select
              id="table-select-filter-organization"
              v-model="selectOrganization"
              :options="organizations"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Retirement"
            label-for="table-select-filter-retiring"
          >
            <b-form-select
              id="table-select-filter-retiring"
              v-model="selectIsRetiring"
              :options="isRetiring"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Ceremony Opt Out"
            label-for="table-select-filter-ceremony-opt-out"
          >
            <b-form-select
              id="table-select-filter-ceremony-opt-out"
              v-model="selectCeremonyOptOut"
              :options="ceremonyOptOut"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
    </b-container>

    <b-container v-if="!isLoading">
      <b-row>
        <b-col align-self="center" class="overflow-auto text-center">
          <div>
            <b-button
              class="m-2"
              variant="outline-secondary"
              @click="applyFilter(1)">
              <BIconChevronDoubleLeft/>
            </b-button>
            <b-button
              v-for="(link, index) in pagination.links"
              v-bind:key="index"
              class="m-2"
              :variant="link.active ? 'info' : 'outline-info'"
              :disabled="!link.url"
              @click="applyFilter(getPageNum(link.url))">
              <BIconCaretLeft v-if="index === 0" />
              <span v-if="index !== 0 && index !== pagination.links.length - 1">
                {{ link.label }}
              </span>
              <BIconCaretRight v-if="index === pagination.links.length - 1" />
            </b-button>
            <b-button
              class="m-2"
              variant="outline-secondary"
              @click="applyFilter(pagination.links.length - 2)">
              <BIconChevronDoubleRight/>
            </b-button>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

import optionServices from "@/services/options.services";
import {
  BIconCaretLeft,
  BIconCaretRight,
  BIconChevronDoubleLeft,
  BIconChevronDoubleRight
} from "bootstrap-vue";

export default {
  name: "filter-recipients-list",
  components: {
    BIconCaretRight,
    BIconCaretLeft,
    BIconChevronDoubleLeft,
    BIconChevronDoubleRight
  },
  props: {
    loader: Function,
  },
  data() {
    return {
      processing: false,
      error: false,
      selectHistorical: '',
      selectStatus: '',
      selectMilestone: '',
      selectIsRetiring: '',
      selectCeremonyOptOut: '',
      selectOrganization: '',
      selectResultsPerPage: '',
      selectName: '',
      selectEmployeeNumber: '',
      selectSortBy: '',
      selectSortOrder: '',
      historical: optionServices.get('isHistorical'),
      statuses: optionServices.get('status'),
      isRetiring: optionServices.get('isRetiring'),
      milestones: optionServices.get('milestones'),
      ceremonyOptOut: optionServices.get('ceremony-opt-out'),
      resultsPerPage: optionServices.get('results-per-page'),
      sortBy: optionServices.get('sort-by'),
      sortOrder: optionServices.get('sort-order'),
    }
  },
  methods: {
    getPageNum(url) {
      const urlArray = url.split('page=') || []
      return urlArray[urlArray.length - 1]
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    clearFilters() {
      this.selectHistorical = ''
      this.selectStatus = ''
      this.selectName = ''
      this.selectEmployeeNumber = ''
      this.selectIsRetiring = ''
      this.selectCeremonyOptOut = ''
      this.selectMilestone = ''
      this.selectOrganization = ''
      this.selectResultsPerPage = ''
      this.selectSortBy = ''
      this.selectSortOrder = ''
      this.loader()
    },
    async applyFilter (pageNum=null) {
      this.processing = true
      const filters = []
      if (this.selectHistorical !== '') filters.push({
        key: 'historical', value: !!this.selectHistorical})
      if (this.selectStatus !== '') filters.push({
        key: 'status', value: !!this.selectStatus})
      if (this.selectName !== '') filters.push({
        key: 'name', value: this.selectName})
      if (this.selectEmployeeNumber !== '') filters.push({
        key: 'employee_number', value: this.selectEmployeeNumber})
      if (this.selectIsRetiring !== '') filters.push({
        key: 'retirement', value: !!this.selectIsRetiring})
      if (this.selectCeremonyOptOut !== '') filters.push({
        key: 'ceremony_opt_out', value: !!this.selectCeremonyOptOut})
      if (this.selectMilestone !== '') filters.push({
        key: 'milestone', value: this.selectMilestone})
      if (this.selectOrganization !== '') filters.push({
        key: 'organization', value: this.selectOrganization})
      if (this.selectResultsPerPage !== '') filters.push({
        key: 'results_per_page', value: this.selectResultsPerPage})
      if (this.selectSortBy !== '') filters.push({
        key: 'sort',
        value: `${this.selectSortBy}${
          this.selectSortOrder!==''
            ? '+' + this.selectSortOrder
            : ''
        }`
      })
      await this.loader(pageNum, filters)
      this.processing = false
    },
  },
  computed: {
    hasFilters() {
      return this.selectName !== ''
        || this.selectEmployeeNumber !== ''
        || this.selectHistorical !== ''
        || this.selectStatus !== ''
        || this.selectIsRetiring !== ''
        || this.selectMilestone !== ''
        || this.selectCeremonyOptOut !== ''
        || this.selectOrganization !== ''
        || this.selectResultsPerPage !== ''
        || this.selectSortBy !== ''
        || this.selectSortOrder !== ''
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
    pagination() {
      return this.$store.getters.getPagination
    },
    user() {
      return this.$store.getters.getUser
    },
    isSuperAdmin () {
      return this.$store.getters.isSuperAdmin
    },
    isAdmin () {
      return this.$store.getters.isAdmin
    },
    isLoading() {
      return this.$store.getters.isLoading
    }
  }
};

</script>
