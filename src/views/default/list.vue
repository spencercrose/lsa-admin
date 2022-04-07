<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <ModalView
      :title="`View ${single || ''} Details`"
      :item="selected"
    />

    <ModalDelete
      :title="`Delete ${single || ''}`"
      :item="selected"
      :url="`${model}/delete/${selected.id || ''}`"
      :rerouteURL="`${model}`"
      :loader="loadData"
    />

    <b-table
      :items="items || []"
      :fields="fields"
      striped
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      responsive="sm"
      :busy.sync="loading"
    >
      <template #head(details)>
        <b-container align="right">
          <b-button
            size="sm"
            class="m-1"
            variant="success"
            @click="reroute(`/${model}/create`)"
          >
            Create {{single}}
          </b-button>
        </b-container>
      </template>
      <template #cell(created_at)="row">
        {{ new Date(row.item.created_at).toLocaleString() }}
      </template>
      <template #cell(updated_at)="row">
        {{ new Date(row.item.updated_at).toLocaleString() }}
      </template>
      <template #cell(details)="row">
        <b-button
          size="sm"
          class="m-1"
          v-b-modal.modal-view-item
          @click="selectItem(row.item)"
        >
          View
        </b-button>
        <b-button
          size="sm"
          class="m-1"
          @click="reroute(`/${model}/edit/${row.item.id}`)"
        >
          Edit
        </b-button>
        <b-button
          size="sm"
          class="m-1"
          variant="secondary"
          v-b-modal.modal-delete-item
          @click="selectItem(row.item)"
        >
          Delete
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
import ModalView from '@/components/ModalView'
import ModalDelete from '@/components/ModalDelete'
import {get} from "@/services/api.services";
import optionsServices from "@/services/options.services";

export default {
  name: `item-list`,
  props: ['header', 'lead', 'mode', 'model', 'single'],
  components: {
    PageHeader,
    ModalView,
    ModalDelete
  },
  data () {
    return {
      loading: false,
      error: false,
      message: '',
      sortBy: 'updated_at',
      sortDesc: true,
      selected: '',
      items: [],
      fields: optionsServices.get(this.$props.model)
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
    }
  },
  methods: {
    selectItem(item) {
      this.selected = item;
    },
    async loadData () {
      this.processing = true
      this.error = false
      const [error, data] = await get(`${this.$props.model}/list`)
      if (error) {
        this.error = true
        this.$store.commit('setMessage', error)
      }
      this.items = data
      this.processing = false
    },
    async reroute(uri) {
      await this.$router.push(uri)
    }
  },
  async beforeMount () {
    this.$store.commit('setLoading', true)
    await this.loadData()
    this.$store.commit('setLoading', false)
  }
}
</script>
