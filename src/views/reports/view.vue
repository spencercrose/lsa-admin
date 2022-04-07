<template>
  <b-container fluid>
    <PageHeader :header="this.label || this.header" :lead="this.description || this.lead" />

    <b-container v-if="!isLoading">
      <b-row align="right">
        <b-col>
          <b-button
            size="sm"
            variant="info" class="m-1"
            :disabled="downloading"
            @click="downloadReport(report.category, report.slug)">
            <b-spinner v-if="downloading" class="mr-1" small /> Download PDF
          </b-button>
          <b-button size="sm" variant="dark" class="m-1" @click="reroute(`/reports`)">
            Return to Reports
          </b-button>
        </b-col>
      </b-row>
    </b-container>

    <b-table
      :items="items"
      :fields="fields"
      striped
      responsive="sm"
      :busy.sync="loading"
    >
    </b-table>

    <b-alert v-if="error" show variant="danger">
      A server error occurred. Please contact the site administrator for assistance.
    </b-alert>

  </b-container>
</template>

<script>

import PageHeader from '@/components/PageHeader'
import reportServices from "@/services/reports.services"
import {getReport, download} from "@/services/api.services"

export default {
  name: 'reports-list',
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data () {
    return {
      label: '',
      report: null,
      description: '',
      loading: false,
      error: false,
      message: '',
      items: [],
      fields: [],
      downloading: false,
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
    categories () {
      return reportServices.categories()
    }
  },
  methods: {
    async loadReport (report) {
      this.error = false
      const {slug='', category='', label='', description='', schema={}} = report || {}

      // relabel page header
      this.label = `Report - ${label}`
      this.description = description

      const [error, reportData] = await getReport(`reports/${category}/${slug}/data`)
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }

      // filter items for viewing
      this.items = (reportData || [])
      this.fields = schema.fields
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async downloadReport (category, slug) {
      this.downloading = true
      this.error = false
      const [error,] = await download(
        `reports/${category}/${slug}/pdf`,
        `lsa-report-${category}-${slug}.pdf`
      )
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }
      this.downloading = false
    },
  },
  async beforeMount () {
    this.$store.commit('setLoading', true)
    this.report = reportServices.get(this.$route.params.id || '')
    await this.loadReport(this.report)
    this.$store.commit('setLoading', false)
  }
}
</script>
