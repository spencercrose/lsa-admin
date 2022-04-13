<template>
    <b-modal
      id="modal-action"
      ref="modal"
      :title="title.toString()"
      scrollable
      @ok="submit"
    >
      <template #modal-footer="{ ok, cancel }">
        <b-button :disabled="!selected" size="sm" variant="info" @click="ok()">
          {{title.toString()}}
        </b-button>
        <b-button size="sm" variant="secondary" @click="cancel()">
          Cancel
        </b-button>
      </template>
      <div>
        <b-container class="p-2 rounded">
          <b-row>
            <b-col>
              <b-form-select
                id="table-select-action"
                v-model="selected"
                :options="options"
                :state="!!selected"
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
  props: ['title', 'action', 'process', 'options'],
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
