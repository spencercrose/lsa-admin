<template>
  <div style="z-index: 9990">
  <b-navbar fixed="top" class="p-0 m-5">
    <b-alert
      class="w-100"
      show="4"
      fade
      v-if="message.text"
      :variant="message.type"
      :dismissible="message.dismissible"
      @dismissed="message={ text:'', type:'' }"
    >
      <b-spinner class="ml-3" small v-if="message.spinner" /> {{message.text}}
    </b-alert>
  </b-navbar>
  </div>
</template>
<script>

export default {
  name: "global-message",
  computed : {
    message: {
      get () {
        return this.$store.getters.getMessage;
      },
      set (value) {
        this.$store.dispatch("setMessage", value )
      }
    }
  }
};
</script>
<style>
  .message-banner {
    z-index: 99999;
  }
</style>
