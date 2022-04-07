<template>
    <b-modal
      id="modal-view-item"
      ref="modal"
      :title="title.toString()"
      scrollable
    >
      <template #modal-footer="{ close }">
        <b-button size="sm" variant="info" @click="close()">
          Close
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

export default {
  name: "modal-view",
  props: ['title', 'item'],
};
</script>
