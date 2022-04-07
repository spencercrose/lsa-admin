<template>
    <b-modal
      id="modal-action"
      ref="modal"
      :title="title.toString()"
      scrollable
      @ok="submit"
    >
      <template #modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="info" @click="ok()">
          {{title.toString()}}
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
      </template>
      <div v-if="action === 'assign'">
        <b-container class="p-2 rounded">
          <b-row>
            <b-col>
              <b-form-select
                id="table-select-action"
                v-model="selected"
                :options="this.$store.getters.getCeremonies"
              ></b-form-select>
            </b-col>
          </b-row>
        </b-container>
      </div>
  </b-modal>
</template>
<script>

export default {
  name: "modal-action",
  props: ['title', 'action', 'process'],
  data() {
    return {
      selected: ''
    }
  },
  methods : {
    async submit() {
      await this.process(this.selected)
    }
  }
};
</script>
