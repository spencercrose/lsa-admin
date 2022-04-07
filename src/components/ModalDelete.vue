<template>
    <b-modal
      id="modal-delete-item"
      ref="modal"
      :title="title.toString()"
      scrollable
      @ok="submit"
    >
      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="info" @click="ok()">
          Delete
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
      </template>
      <b-table
        :items="[item]"
        striped
        stacked
        responsive="sm"
      >
        <template #cell(created_at)="row">
          {{ new Date(row.item.created_at).toLocaleString() }}
        </template>
        <template #cell(updated_at)="row">
          {{ new Date(row.item.updated_at).toLocaleString() }}
        </template>
      </b-table>
  </b-modal>
</template>
<script>

import {get} from "../services/api.services";

export default {
  name: "modal-delete",
  props: ['title', 'item', 'url', 'rerouteURL', 'loader'],
  data() {
    return {
      processing: false
    }
  },
  methods : {
    async submit() {
      this.processing = true
      const [error, result] = await get(this.url)
      const { id='' } = result || {}
      if (error || !id) this.$store.commit('setMessage', {
        text: 'An error occurred. Your deletion could not be completed',
        type: 'error'
      })
      else {
        // successful deletion
        this.$store.commit('setMessage', {
          text: `${this.title} successfully deleted`, type: 'success'
        })
        // reload data and close modal
        this.loader()
        this.$bvModal.hide('modal-delete-item')
      }
      this.processing = false
    }
  }
};
</script>
