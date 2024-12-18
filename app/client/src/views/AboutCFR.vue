<template>
  <section class="section">
    <LoadingIndicator v-if="isFetching" message="Loading..." />
    <Alert v-if="noPscPassed" type="error" message="No Point Source Category has been selected." />
    <div v-if="cfrResults">
      <div class="elg-breadcrumbs-container">
        <div>
          <Breadcrumbs
            :pages="[
              { title: 'Search', path: '/' },
              { title: 'Results', path: '/results' },
              { title: 'About 40 CFR', isCurrent: true },
            ]"
          />
        </div>
        <div>
          <router-link to="/results" class="usa-button usa-button--unstyled">
            <span class="fa fa-reply"></span>Back to Results
          </router-link>
        </div>
      </div>
      <div class="elg-header-container">
        <div class="page-heading">
          <h2 class="text-bold">
            About 40 CFR {{ cfrResults.pointSourceCategoryCode }}: {{ cfrResults.pointSourceCategoryName }}
          </h2>
          <h3 class="is-size-5 subtitle">Applicability, General Requirements, and Definitions</h3>
        </div>
      </div>
      <Alert type="info">
        This page presents applicability, definitions, best management practices, monitoring requirements, and other
        general provisions applicable to the point source category (presented first) and subcategories. Click on the
        tabs to view the CFR text of interest. If there is no applicability text in the CFR, ’No Data Available’ will be
        noted.
      </Alert>
      <div class="grid-row grid-gap-2">
        <div class="grid-col">
          <Alert type="" class="display-inline-block">
            <div>
              <p>
                <span class="text-bold">Initial Promulgation:</span>
                {{ cfrResults.initialPromulgationDate }}
              </p>
              <p>
                <span class="text-bold">Latest Promulgation:</span>
                {{ cfrResults.mostRecentRevisionDate }}
              </p>
              <p>
                <button class="usa-button is-hyperlink" @click="() => (shouldDisplayNaicsModal = true)">
                  Industry NAICS Codes
                </button>
              </p>
              <p>
                <button class="usa-button is-hyperlink" @click="() => (shouldDisplaySicModal = true)">
                  Industry SIC Codes
                </button>
              </p>
            </div>
          </Alert>
        </div>
        <div class="cfr-link grid-col">
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
            <span class="text-bold">{{ definition.term }}: </span>
            {{ definition.definition }}
            <span v-if="definition.typoFlagDefinition">
              <br />
              <span class="fa fa-exclamation-triangle"></span>
              <span style="font-style: italic">{{ definition.typoFlagDefinition }}</span>
            </span>
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
            <span class="text-bold">{{ provision.cfrSection }}: </span>
            {{ provision.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Alert from '@/components/shared/Alert.vue';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import LoadingIndicator from '@/components/shared/LoadingIndicator.vue';
import Modal from '@/components/shared/Modal.vue';

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
    ...mapState('aboutCfr', ['isFetching', 'cfrResults', 'cfrDefinitions']),
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
      this.selectedProvisionTypes[subcategoryId] = provisionType;
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
      return (!selected && provisionType === 'applicabilityProvisions') || selected === provisionType;
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

.subtitle {
  margin-bottom: 1rem;
}

// Card styles
.card {
  margin-bottom: 1.5rem;
  border-radius: 4px;
  color: #212121;
  box-shadow:
    0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
    0 0 0 1px rgba(10, 10, 10, 0.02);
}

.card-content {
  padding: 1.5rem;
  font-size: 1rem;
}

.card-content p:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: stretch;
  box-shadow: none;
  background-color: rgba(0, 113, 188, 0.05);
}

.card-header-title {
  border-bottom: 1px solid #dbdbdb;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 0.75rem 1rem;
  margin: 0;
  display: flex;
  flex-grow: 1;
  align-items: center;
}

// Card tab styles
.tabs {
  width: 100%;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  overflow: hidden;
  overflow-x: auto;
  white-space: nowrap;
}

.tabs > ul {
  list-style: none;
  padding: 0;
  margin: auto 0 0 0;
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
  flex-shrink: 0;
  border-bottom: 1px solid #dbdbdb;

  li {
    margin: auto 0.5rem 0 0;
  }

  li button {
    font-weight: bold;
    border-color: #e6e6e6;
    border-right: none;
    border-bottom: none;
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

.fa-exclamation-triangle {
  color: $danger;
}
</style>
