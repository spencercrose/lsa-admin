<template>
  <div>
    <b-jumbotron
      id="page-header"
      header-level="5"
      :header="this.$props.header"
      :lead="this.$props.lead"
    />
    <b-alert v-if="isLoading" variant="light" show>
      <b-spinner class="ml-3" small /> Please wait while the page loads ...
    </b-alert>
  </div>
</template>

<script>

export default {
  name: "page-header",
  props: {
    lead: String,
    header: String
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading
    }
  }
};

</script>
<style>
#page-header {
  padding: 1em;
}
</style>
