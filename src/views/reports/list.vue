<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-container v-if="!isLoading">
      <b-alert v-if="!isAdmin" variant="info" show>Sign in to view this page.</b-alert>
      <b-alert v-if="downloading" variant="info" show>
        <b-spinner class="mr-1" small />Downloading ...
      </b-alert>
      <b-row align-h="between">
        <b-col cols="6">
          <b-form-group
            label="Category"
            label-for="table-select-filter-category"
            label-cols="3"
          >
            <b-form-select
              id="table-select-filter-category"
              v-model="selectCategory"
              :options="categories || []"
              class="mb-3"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-button size="sm" @click="clearFilters">Clear Filters</b-button>
        </b-col>
        <b-col cols="4">
          <b-button
            v-if="isAdmin"
            size="sm"
            variant="dark"
            :disabled="downloading"
            @click="downloadFile('recipients', 'summary', 'csv')">
            Export CSV (Recipients)
          </b-button>
        </b-col>
      </b-row>
    </b-container>

    <b-table
      :items="reports || []"
      :fields="fields"
      striped
      :filter="criteria"
      :filter-function="applyFilter"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      responsive="sm"
      :busy.sync="loading"
    >

      <template #cell(details)="row">
        <b-button
          size="sm"
          class="m-1"
          @click="reroute(`/reports/view/${row.item.id}`)"
        >
          View
        </b-button>
        <b-button
          size="sm"
          class="m-1"
          :disabled="downloading"
          @click="downloadFile(row.item.category, row.item.slug, 'pdf')"
        >
          Download PDF
        </b-button>
      </template>

    </b-table>

    <b-alert v-if="error" show variant="danger">
      A server error occurred. Please contact the site administrator for assistance.
    </b-alert>

  </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import reportServices from "@/services/reports.services";
import {download} from "@/services/api.services"


export default {
  name: 'reports-list',
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data () {
    return {
      loading: false,
      error: false,
      message: '',
      sortBy: 'name',
      sortDesc: true,
      selectCategory: '',
      fields: [
        {key: 'label', label: 'Name', sortable: true},
        {key: 'category', sortable: true},
        {key: 'description', sortable: false},
        {key: 'details', label: '', sortable: false}
      ],
      downloading: false
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
    reports () {
      return reportServices.reports() || []
    },
    categories () {
      return reportServices.categories()
    },
    criteria () {
      return {
        category: this.selectCategory
      }
    },
  },
  methods: {
    clearFilters() {
      this.selectCategory = ''
    },
    applyFilter(row) {
      return !this.criteria.category || row.category === this.criteria.category
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async downloadFile (category, slug, format) {
      this.downloading = true
      this.error = false
      const [error,] = await download(
        `reports/${category}/${slug}/${format}`,
        `lsa-report-${category}-${slug}.${format}`
      )
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }
      this.downloading = false
    }
  }
}
</script>
