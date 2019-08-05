<template>
  <section class="page-header">
    <div class="container">
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <router-link class="navbar-item is-size-5" to="/">
            ELG Search Tools
          </router-link>

          <a
            role="button"
            :class="'navbar-burger burger' + (isActive ? ' is-active' : '')"
            aria-label="menu"
            aria-expanded="false"
            data-target="mainNav"
            @click="isActive = !isActive"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="mainNav" :class="'navbar-menu burger' + (isActive ? ' is-active' : '')">
          <div class="navbar-end">
            <div class="navbar-item">
              <router-link class="navbar-item" to="/dashboard">
                <strong>Search</strong>
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>

export default {
  props: ['userName'],
  components: {},
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
    logout() {
      this.$auth.logout();
    },
    generateQapp() {
      this.$router.push({ name: 'generate', params: { id: this.$store.state.qapp.id } });
    },
  },
};
</script>

<style>
.page-header {
  background-color: #fff;
  font-weight: bold;
}
.generate-btn {
  padding: 0 0.5em;
}
</style>
