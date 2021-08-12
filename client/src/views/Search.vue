<template>
  <section class="section">
    <p>
      The ELG Database allows easy access to information relevant to the effluent limitations guidelines and standards
      (ELGs) program. The ELG Database includes the ELGs as promulgated in the Code of Federal Regulations (CFR); CFR
      citation history (links the dates and federal register notices (FRN) to the corresponding CFR section); and
      readily available technology bases/pollutant long-term averages associated with the promulgated regulations.
    </p>
    <div class="columns">
      <div class="column">
        <button class="button is-hyperlink" @click="shouldShowDisclaimers = true">
          <span class="fa fa-exclamation-triangle"></span> Click Here to View Disclaimers
        </button>
      </div>
      <div class="column">
        <div class="cfr-link is-pulled-right">
          <a href="https://www.epa.gov/eg" target="_blank" rel="noopener noreferrer">
            Effluent Guidelines home page<span class="fa fa-external-link-alt" />
          </a>
        </div>
      </div>
    </div>

    <Modal v-if="shouldShowDisclaimers" title="Disclaimers" @close="() => (shouldShowDisclaimers = false)">
      <Alert type="warning">
        EPA intends for the ELG Database to be solely used to access information on the effluent guidelines program via
        guided and customized searches. The ELG Database contains information on the requirements of this program, but
        it does not replace the Code of Federal Regulations which is the codification of the general and permanent rules
        published in the Federal Register. Therefore, this tool is not an official legal edition of the CFR.
      </Alert>
      <Alert type="warning">
        Treatment technologies are classified to the most discrete level possible according to the descriptions in the
        underlying regulatory development documents. Results for broad treatment technologies (e.g., biological
        treatment) only include those technologies that cannot be more specifically classified.
      </Alert>
    </Modal>
    <SearchBar />
    <p class="contact-us">
      <span v-html="this.contactInfo" />
    </p>
  </section>
</template>

<script>
import { get } from 'vuex-pathify';
import Alert from '@/components/shared/Alert';
import Modal from '@/components/shared/Modal';
import SearchBar from '@/components/shared/SearchBar';

export default {
  data() {
    return {
      shouldShowDisclaimers: false,
    };
  },
  components: {
    Alert,
    Modal,
    SearchBar,
  },
  computed: {
    ...get('search', ['contactInfo']),
  },
  created() {
    this.$store.dispatch('search/getContactInfo');
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';

h1 {
  text-align: center;
}

.fa-exclamation-triangle {
  color: #ffdd57;
}

.adv-search {
  padding-left: 23px;
}

.underline-text {
  text-decoration: underline;
}

.cfr-link a:visited {
  color: $blue;
}

.contact-us {
  margin-top: 1.5rem;
  padding-bottom: 0;

  a {
    text-decoration: underline;
  }
}
</style>
