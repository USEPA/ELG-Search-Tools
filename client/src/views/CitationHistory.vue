<template>
  <section class="section">
    <LoadingIndicator v-if="isFetching" message="Loading..." />
    <Alert v-if="noPscPassed" type="error" message="No Point Source Category has been selected." />
    <div v-if="cfrCitationHistory">
      <div class="columns elg-breadcrumbs-container">
        <div class="column">
          <Breadcrumbs
            :pages="[
              { title: 'Search', path: '/' },
              { title: 'Results', path: '/results' },
              { title: 'About 40 CFR', pathObject: { path: '/results/about-cfr', query: $route.query } },
              { title: 'Citation History', isCurrent: true },
            ]"
          />
        </div>
        <div class="column">
          <router-link
            :to="{ path: '/results/about-cfr', query: $route.query }"
            class="button has-text-white is-pulled-right"
          >
            <span class="fa fa-reply"></span>Back to About CFR
          </router-link>
        </div>
      </div>
      <div class="elg-header-container">
        <h2 class="is-size-4 has-text-weight-bold title">
          About CFR {{ cfrResults.pointSourceCategoryCode }}: {{ cfrResults.pointSourceCategoryName }}
        </h2>
        <h3 class="is-size-5 subtitle">CFR Citation History</h3>
      </div>
      <Table :columns="columns" :rows="rows" />
    </div>
  </section>
</template>

<script>
import { get } from 'vuex-pathify';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Table from '@/components/shared/Table';

export default {
  components: { Alert, Breadcrumbs, LoadingIndicator, Table },
  data() {
    return {
      noPscPassed: false,
      columns: [
        { key: 'cfrSection', label: 'CFR Section' },
        { key: 'subcategory', label: 'Subcategory' },
        { key: 'description', label: 'CFR Section Description' },
        { key: 'publicationDate', label: 'Publication Date' },
        { key: 'federalRegisterNoticeInCfr', label: 'Federal Register Notice (in CFR)' },
        { key: 'federalRegisterNoticeFirstPage', label: 'Federal Register Notice (1st Page)' },
      ],
    };
  },
  computed: {
    ...get('aboutCfr', ['isFetching', 'cfrResults', 'cfrCitationHistory']),
    rows() {
      return this.cfrCitationHistory.map((row) => ({
        ...row,
        publicationDate: row.publicationDate
          ? row.publicationDate.replace(/(\d\d\d\d)-(\d\d)-(\d\d).*/g, '$2/$3/$1')
          : null,
      }));
    },
  },
  mounted() {
    if (!this.$route.query.psc && !this.cfrCitationHistory) {
      this.noPscPassed = true;
      return;
    }
    this.$store.dispatch('aboutCfr/getCfrCitationHistory', this.$route.query.psc);
  },
};
</script>

<style lang="scss" scoped></style>
