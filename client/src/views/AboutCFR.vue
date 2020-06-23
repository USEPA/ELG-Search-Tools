<template>
  <section class="section">
    <LoadingIndicator v-if="isFetching" message="Loading..." />
    <Alert v-if="noPscPassed" type="error" message="No Point Source Category has been selected." />
    <div v-if="cfrResults">
      <div class="columns elg-breadcrumbs-container">
        <div class="column">
          <Breadcrumbs
            :pages="[
              { title: 'Search', path: '/' },
              { title: 'Results', path: '/results' },
              { title: 'About 40 CFR', isCurrent: true },
            ]"
          />
        </div>
        <div class="column">
          <router-link to="/results" class="button has-text-white is-pulled-right">
            <span class="fa fa-reply"></span>Back to Results
          </router-link>
        </div>
      </div>
      <div class="columns elg-header-container">
        <div class="column is-10 page-heading">
          <h2 class="is-size-4 has-text-weight-bold">
            About 40 CFR {{ cfrResults.pointSourceCategoryCode }}: {{ cfrResults.pointSourceCategoryName }}
          </h2>
          <h3 class="is-size-5 subtitle">Applicability, General Requirements, and Definitions</h3>
        </div>
        <div class="column help-icons">
          <div class="field is-grouped">
            <span class="fas fa-book has-text-grey-dark help-icon"></span>
            <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
          </div>
          <div class="field is-grouped help-container">
            <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
            <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
          </div>
        </div>
      </div>
      <Alert type="info">
        This page presents applicability, definitions, best management practices, monitoring requirements, and other
        general provisions applicable to the point source category (presented first) and subcategories. Click on the
        tabs to view the CFR text of interest. If there is no applicability text in the CFR, ’No Data Available’ will be
        noted.
      </Alert>
      <div class="columns">
        <div class="column">
          <div class="info-box-container message">
            <div class="message-body">
              <p>
                <span class="has-text-weight-bold">Initial Promulgation:</span>
                {{ cfrResults.initialPromulgationDate }}
              </p>
              <p>
                <span class="has-text-weight-bold">Latest Promulgation:</span>
                {{ cfrResults.mostRecentRevisionDate }}
              </p>
              <p>
                <button class="button is-hyperlink" @click="() => (shouldDisplayNaicsModal = true)">
                  Industry NAICS Codes
                </button>
              </p>
              <p>
                <button class="button is-hyperlink" @click="() => (shouldDisplaySicModal = true)">
                  Industry SIC Codes
                </button>
              </p>
            </div>
          </div>
        </div>
        <div class="cfr-link column">
          <router-link
            :to="{
              path: '/results/about-cfr/citation-history',
              query: { psc: $route.query.psc },
            }"
          >
            Go To Citation History
            <span class="fa fa-external-link-alt"></span>
          </router-link>
        </div>
      </div>

      <Modal
        v-if="shouldDisplayNaicsModal"
        title="Industry NAICS Codes"
        @close="() => (shouldDisplayNaicsModal = false)"
      >
        <Alert type="info">
          These codes are generally associated with the industry but the applicability statement(s) in the CFR are the
          legal basis for the regulated facilities.
        </Alert>
        <ul class="elg-bullet-list">
          <li v-for="naics in cfrResults.naicsCodes" :key="naics.naicsCode">
            {{ naics.naicsCode }} - {{ naics.naicsDescription }}
          </li>
        </ul>
      </Modal>
      <Modal v-if="shouldDisplaySicModal" title="Industry SIC Codes" @close="() => (shouldDisplaySicModal = false)">
        <p v-if="!cfrResults.sicCodes.length" class="is-italic">No data available.</p>
        <div v-else>
          <Alert type="info">
            These codes are generally associated with the industry but the applicability statement(s) in the CFR are the
            legal basis for the regulated facilities.
          </Alert>
          <ul class="elg-bullet-list">
            <li v-for="sic in cfrResults.sicCodes" :key="sic.sicCode">{{ sic.sicCode }} - {{ sic.sicDescription }}</li>
          </ul>
        </div>
      </Modal>

      <div v-for="subcategory in results" class="card" :key="subcategory.id">
        <header class="card-header">
          <div class="tabs is-boxed">
            <p class="card-header-title">Subcategory: {{ subcategory.comboSubcategory }}</p>
            <ul>
              <li
                v-for="provision in availableProvisions(subcategory)"
                :key="provision.prop"
                :class="isActive(selectedProvisionTypes[subcategory.id], provision.prop) ? 'is-active' : ''"
              >
                <button :title="provision.abbr" @click="setProvisionType(subcategory.id, provision.prop)">
                  {{ provision.label }}
                </button>
              </li>
            </ul>
          </div>
        </header>
        <div v-if="isActive(selectedProvisionTypes[subcategory.id], 'definitions')" class="card-content">
          <p v-for="definition in subcategory.definitions" :key="definition.term">
            <span class="has-text-weight-bold">{{ definition.term }}: </span>
            {{ definition.definition }}
          </p>
        </div>
        <div v-else class="card-content">
          <p
            v-if="!subcategory[selectedProvisionTypes[subcategory.id] || 'applicabilityProvisions'].length"
            class="is-italic"
          >
            No data available.
          </p>
          <p
            v-for="provision in subcategory[selectedProvisionTypes[subcategory.id] || 'applicabilityProvisions']"
            :key="provision.cfrSection"
          >
            <span class="has-text-weight-bold">{{ provision.cfrSection }}: </span>
            {{ provision.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { get } from 'vuex-pathify';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Modal from '@/components/shared/Modal';

export default {
  components: { Alert, Breadcrumbs, LoadingIndicator, Modal },
  data() {
    return {
      noPscPassed: false,
      shouldDisplayNaicsModal: false,
      shouldDisplaySicModal: false,
      provisions: [
        { prop: 'applicabilityProvisions', label: 'Applicability' },
        { prop: 'definitions', label: 'Definitions' },
        { prop: 'bmpProvisions', label: 'BMPs', abbr: 'Best Management Practices' },
        { prop: 'monitoringRequirementProvisions', label: 'Monitoring Requirements' },
        { prop: 'otherProvisions', label: 'Other' },
      ],
      selectedProvisionTypes: {},
    };
  },
  computed: {
    ...get('aboutCfr', ['isFetching', 'cfrResults', 'cfrDefinitions']),
    results() {
      return this.cfrResults
        ? this.cfrResults.subcategories.map((subcat) => {
            return {
              ...subcat,
              definitions: this.cfrDefinitions
                ? this.cfrDefinitions.subcategories.find((s) => s.id === subcat.id).definitions
                : [],
            };
          })
        : [];
    },
  },
  methods: {
    setProvisionType(subcategoryId, provisionType) {
      this.$set(this.selectedProvisionTypes, subcategoryId, provisionType);
    },
    availableProvisions(subcategory) {
      const provisionsWithData = this.provisions.filter((p) => subcategory[p.prop].length);
      // Always display Applicability tab, even if there is no data available for it
      if (!provisionsWithData.find((p) => p.prop === 'applicabilityProvisions')) {
        provisionsWithData.unshift({ prop: 'applicabilityProvisions', label: 'Applicability' });
      }
      return provisionsWithData;
    },
    isActive(selected, provisionType) {
      if ((!selected && provisionType === 'applicabilityProvisions') || selected === provisionType) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    if (!this.$route.query.psc && !this.cfrResults) {
      this.noPscPassed = true;
      this.$store.commit('aboutCfr/SET_IS_FETCHING', false);
      return;
    }
    this.$store.dispatch('aboutCfr/getCfrResults', this.$route.query.psc);
    this.$store.dispatch('aboutCfr/getCfrDefinitions', this.$route.query.psc);
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';

// Card styles
.card {
  margin-bottom: 1.5rem;
  border-radius: 4px;
  color: #212121;
}

.card-content p:last-child {
  padding-bottom: 0;
}

.card-header {
  box-shadow: none;
  background-color: rgba(0, 113, 188, 0.05);
}

.card-header-title {
  border-bottom: 1px solid #dbdbdb;
  font-size: 1.1rem;
}

// Card tab styles
.tabs {
  width: 100%;
}

.tabs > ul {
  padding: 0;
  justify-content: flex-end;

  li {
    margin-top: auto;
    margin-right: 0.5rem;
  }

  li button {
    padding: 0.5rem 1rem;
  }

  li.is-active button {
    margin-bottom: -1px;
    font-weight: bold;
    color: $blue;
    background-color: white;
    border: 1px solid #dbdbdb;
    border-bottom-color: transparent !important;
    cursor: default;
  }
}

.cfr-link {
  text-align: right;
  margin: auto 0 1rem 0;
}

.info-box-container,
.cfr-link {
  margin-bottom: 0;
}

// Mobile styles
@media screen and (max-width: 768px) {
  .card-header-title {
    border-bottom: none;
  }

  .tabs {
    display: block;

    ul {
      justify-content: flex-start;
    }
  }
}
</style>
