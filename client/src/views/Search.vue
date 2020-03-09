<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-2">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
        <p>
          The goal of the ELG Database Web Application is to provide the Agency and other interested parties easy access
          to information relevant to the effluent limitations guidelines and standards (ELGs) program. The ELG Database
          includes the ELGs as promulgated in the Code of Federal Regulations (CFR); CFR citation history (links the
          dates and federal register notices (FRN) to the corresponding CFR section); and readily available technology
          bases/pollutant long-term averages for the regulations.
        </p>
        <p>
          <span class="underline-text">Note to EPA Testers</span>:
          <i>
            &nbsp; We are currently in the process of populating and performing quality control checks on data in the
            ELG Database before translating to the web application program. Therefore, the information included in this
            web application is incomplete. ERG plans on continuing to add and update content in the database and in the
            web application as EPA conducts reviews on the web application development.</i
          >
        </p>
        <p>
          Please select one of the following search criteria: point source category, pollutant, or treatment technology.
        </p>
        <SearchBar />
      </div>
    </div>
    <div class="colunns">
      <div class="column is-2 is-offset-10 adv-search">
        <a class="is-link" @click="onNavigate">Advanced Search</a>
      </div>
    </div>
  </section>
</template>

<script>
import SearchBar from '@/components/shared/SearchBar';

export default {
  data() {
    return {};
  },
  components: {
    SearchBar,
  },
  methods: {
    onNavigate() {
      this.$router.push('customSearch');
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  text-align: center;
}
p {
  text-align: center;
  font-size: 18px;
}

.adv-search {
  padding-left: 23px;
}

.underline-text {
  text-decoration: underline;
}
</style>
