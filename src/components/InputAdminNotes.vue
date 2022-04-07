<template>
  <b-container fluid>
    <b-card
      header-tag="header"
      header-class="font-weight-bold"
      bg-variant="light"
      class="mb-3 mt-3"
    >
      <template #header>
        Administrator's Notes
      </template>

      <b-form-group
        id="fieldset-admin-notes"
      >
        <b-form-textarea
          id="input-admin-notes"
          v-model="recipient.admin_notes"
        />
      </b-form-group>

    </b-card>
  </b-container>
</template>

<script>

export default {
  name: "input-admin-notes",
  computed: {
    recipient() {
      return this.$store.getters.getFormData;
    }
  }
};
</script>
