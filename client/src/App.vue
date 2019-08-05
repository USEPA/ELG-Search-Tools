<template>
  <div id="app">
    <div v-if="$auth.ready()" class="app-container">
      <info-header class="info-header" v-if="$auth.check()" />
      <page-header class="page-header" />
      <section class="main-section section has-text-white">
        <div class="container">
          <router-view />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import InfoHeader from './components/app/InfoHeader';
import PageHeader from './components/app/PageHeader';

export default {
  name: 'App',
  components: {
    PageHeader,
    InfoHeader,
  },
};
</script>
