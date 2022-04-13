<template>
  <div id="app">
    <header>
      <NavBar />
      <Message />
    </header>
    <main>
      <b-alert class="m-5" show variant="info" v-if="isLoading">
        <b-spinner class="mr-3" small />Loading...
      </b-alert>
      <b-container fluid v-if="isAuthenticated" class="mt-3">
        <router-view :key="$route.fullPath" />
      </b-container>
      <Login v-else />
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script>

import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Message from '@/components/Message'
import Login from '@/views/users/login'

export default {
  name: 'app',
  components: {
    NavBar,
    Message,
    Footer,
    Login
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    isLoading() {
      return this.$store.getters.isLoading
    }
  }
}

</script>

<style>

main {
  margin-top: 100px;
  padding-bottom: 80px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
footer {
  margin-top: 80px;
}

</style>
