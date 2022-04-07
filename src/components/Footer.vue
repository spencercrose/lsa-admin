<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark" class="p-1">

      <b-navbar-brand href="#">
        <img height="60px" src="../assets/wiw-white-text.svg" alt="Where Ideas Work" />
      </b-navbar-brand>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-navbar-nav>
<!--          <b-nav-item href="#">Terms of Use</b-nav-item>-->
<!--          <b-nav-item href="#">Privacy</b-nav-item>-->
        </b-navbar-nav>
      </b-navbar-nav>

    </b-navbar>
  </div>
</template>
<script>
export default {
  name: "Footer",
  computed : {
    isLoggedIn () {
      return this.$store.getters.isAuthenticated
    }
  }
};
</script>
