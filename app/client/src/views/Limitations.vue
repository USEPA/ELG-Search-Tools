<template>
  <section v-if="!limitationData" class="section">
    <Alert type="error"
      >You must come to this page from a results page.
      <router-link to="/" class="has-text-dark">Return Home</router-link> to run a search and select limitations to
      view.</Alert
    >
  </section>
  <section v-else class="section">
    <div class="elg-breadcrumbs-container">
      <div>
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Limitations', isCurrent: true },
          ]"
        />
      </div>
      <div>
        <router-link to="/results" class="usa-button usa-button--unstyled">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </router-link>
      </div>
    </div>
    <div>
      <h2 v-if="subcategoryData" class="is-size-4 has-text-weight-bold">
        Point Source Category {{ selectedCategory.pointSourceCategoryCode }}:
        {{ selectedCategory.pointSourceCategoryName }} Limitations
      </h2>
      <h2 v-if="!subcategoryData && limitationData" class="is-size-4 has-text-weight-bold">
        {{ pollutantDescription }}
        {{ treatmentNames }}
        Limitations
      </h2>
      <h3
        v-if="!subcategoryData && limitationData && pointSourceCategoryCode"
        class="subtitle is-size-5 has-text-weight-light"
      >
        Point Source Category {{ pointSourceCategoryCode }}: {{ pointSourceCategoryName }}
      </h3>
      <h3
        v-if="!subcategoryData && limitationData && !pointSourceCategoryCode"
        class="subtitle is-size-5 has-text-weight-light"
      >
        Point Source Categories {{ getPscs(limitationData) }}
      </h3>
      <h3 v-if="subcategoryData" class="subtitle is-size-5 has-text-weight-light">
        Subpart {{ subcategoryData.comboSubcategory }}
      </h3>
    </div>
    <Alert v-if="subcategoryData" type="">
      <div class="message-body">
        <p><span class="has-text-weight-bold">CFR Section:</span> {{ limitationData.cfrSection }}</p>
        <p><span class="has-text-weight-bold">Level of Control:</span> {{ limitationData.controlTechnologyCode }}</p>
        <p><span class="has-text-weight-bold">Process Operation/Wastestream:</span> {{ limitationData.title }}</p>
        <p>
          <span class="has-text-weight-bold">Other Process/Wastestream Details: </span>
          <span v-html="limitationData.secondary"></span>
        </p>
      </div>
    </Alert>
    <DownloadLink
      v-if="subcategoryData"
      title="Limitations"
      :url="`/api/wastestreamProcessLimitations?id=${selectedLimitationId}`"
    />
    <Table v-if="subcategoryData" :columns="pscColumns" :rows="limitationData.limitations">
      <template v-slot:cell(goToLta)="{ item }">
        <span v-if="item.longTermAverageCount > 0">
          <a @click="shouldDisplayLongTermAvgData(item)">
            <span class="fas fa-share-square limitation-link"></span>
          </a>
        </span>
        <span v-else>--</span>
      </template>
    </Table>
    <Alert v-if="!subcategoryData && limitationData" type="info" style="margin-bottom: 1.5rem">
      Select the tabs below to view different levels of control. If there are no requirements for a level of control,
      "No data available" will be noted. Filters can be used to limit the data displayed in the results. To remove the
      filter, select the criteria a second time.
    </Alert>
    <ControlTabs v-if="!subcategoryData && limitationData" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template v-for="controlTechnologyCode in controlTechTabs" v-slot:[controlTechnologyCode]>
        <div :key="controlTechnologyCode" class="tab-content poll-limit-tab-content">
          <div class="poll-limitation-container">
            <DownloadLink title="Limitations" :url="pollDownloadUrl" />
            <Table :columns="pollLimitationCols" :rows="getControlTechLimitations(controlTechnologyCode)">
              <template v-slot:cell(comboSubcategory)="{ item, value }">
                <span v-if="isComparingPscs">{{ item.pointSourceCategoryCode }}</span> {{ value }}
              </template>
              <template v-slot:cell(goToLta)="{ item }">
                <span v-if="item.longTermAverageCount > 0">
                  <a @click="shouldDisplayLongTermAvgData(item)">
                    <span class="fas fa-share-square limitation-link"></span>
                  </a>
                </span>
                <span v-else>--</span>
              </template>
              <template v-slot:cell(wastestreamProcessSecondary)="{ value }">
                <span v-html="value" />
              </template>
            </Table>
          </div>
        </div>
      </template>
    </ControlTabs>
    <Modal v-if="shouldDisplayCheckboxModal" @close="() => (shouldDisplayCheckboxModal = false)">
      {{ currentCheckboxInfo }}
    </Modal>
    <Modal v-if="shouldDisplayUnitDescriptionModal" @close="() => (shouldDisplayUnitDescriptionModal = false)">
      <div class="info-modal">
        <h3 v-if="currentRow.limitationUnitDescription"><strong>Limitation Unit Description</strong></h3>
        <p>{{ currentRow.limitationUnitDescription }}</p>
      </div>
    </Modal>
    <Modal
      v-if="shouldDisplayTypeOfLimitationModal"
      :title="currentRow.limitationDurationDescription"
      @close="() => (shouldDisplayTypeOfLimitationModal = false)"
    >
      <div class="info-modal">
        <h3 v-if="currentRow.wastestreamProcessLimitCalculationDescription">
          <strong>Limitation Calculation Description</strong>
        </h3>
        <p>
          {{ currentRow.wastestreamProcessLimitCalculationDescription }}
          <span v-if="item.wastestreamProcessTypoFlagLimitCalculationDescription">
            <br />
            <span class="fa fa-exclamation-triangle"></span>
            <span style="font-style: italic">
              {{ item.wastestreamProcessTypoFlagLimitCalculationDescription }}
            </span>
          </span>
        </p>
        <h3 v-if="currentRow.limitRequirementDescription">
          <strong>Limitation Requirement Description</strong>
        </h3>
        <p>{{ currentRow.limitRequirementDescription }}</p>
        <h3 v-if="currentRow.limitationPollutantNotes">
          <strong>Notes</strong>
        </h3>
        <p>{{ currentRow.limitationPollutantNotes }}</p>
      </div>
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Alert from '@/components/shared/Alert.vue';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import Table from '@/components/shared/Table.vue';
import ControlTabs from '@/components/shared/ControlTabs.vue';
import Modal from '@/components/shared/Modal.vue';
import DownloadLink from '@/components/shared/DownloadLink.vue';
import { mapStatesToComputed } from '../store';

export default {
  components: { Alert, Breadcrumbs, Table, ControlTabs, Modal, DownloadLink },
  computed: {
    ...mapState('search', ['selectedCategory', 'subcategoryData', 'selectedPscs']),
    ...mapState('limitations', [
      'limitationData',
      'pointSourceCategoryCode',
      'pointSourceCategoryName',
      'pollutantId',
      'pollutantDescription',
      'treatmentNames',
      'isComparingPscs',
      'selectedLimitationId',
    ]),
    ...mapStatesToComputed('results', ['activeTab']),
    pollDownloadUrl() {
      let pollIds = this.pollutantId;
      let pscCodes = this.pointSourceCategoryCode;
      if (this.isComparingPscs) {
        pollIds = this.selectedPscs.map((psc) => psc.pollutantId).join(',');
        pscCodes = this.selectedPscs.map((psc) => psc.pointSourceCategoryCode).join(',');
      }
      return `/api/pollutantLimitations/?pollutantId=${pollIds}&pointSourceCategoryCode=${pscCodes}`;
    },
  },
  data() {
    return {
      shouldDisplayUnitDescriptionModal: false,
      shouldDisplayTypeOfLimitationModal: false,
      currentCheckboxInfo: null,
      shouldDisplayCheckboxModal: false,
      controlTechTabs: ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'],
      currentRow: null,
      pscColumns: [
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'limitationDurationTypeDisplay',
          label: 'Type of Limitation',
          filterable: true,
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'limitationUnitCode',
          label: 'Units',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
          filterable: true,
        },
        {
          key: 'goToLta',
          label: 'Go to LTA',
          sortable: false,
        },
      ],
      pollLimitationCols: [
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'comboSubcategory',
          label: 'Subpart',
        },
        {
          key: 'wastestreamProcessTitle',
          label: 'Process Operation/Wastestream',
        },
        {
          key: 'wastestreamProcessSecondary',
          label: 'Other Process/Wastestream Detail(s)',
          displayAsHTML: true,
        },
        {
          key: 'limitationDurationTypeDisplay',
          label: 'Type of Limitation',
          filterable: true,
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'limitationUnitCode',
          label: 'Units',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
          filterable: true,
        },
        {
          key: 'goToLta',
          label: 'Go to LTA',
          sortable: false,
        },
      ],
    };
  },
  methods: {
    getPscs(data) {
      return data
        .map((row) => `${row.pointSourceCategoryCode}: ${row.pointSourceCategoryName}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');
    },
    async shouldDisplayLongTermAvgData(row) {
      await this.$store.dispatch('limitations/getLongTermAvgData', row.limitationId);
      await this.$router.push('/results/limitations/long-term-average');
    },
    getControlTechLimitations(controlTechCode) {
      return this.limitationData.filter((limitation) => limitation.controlTechnologyCode === controlTechCode);
    },
    changeControlTechTab(tabId) {
      this.activeTab = tabId;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';
button {
  background: $blue;
}

.subtitle {
  font-family: inherit;
  margin-bottom: 0.75rem;
}

a.usa-button {
  margin-bottom: 0;
}

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
}

.poll-limitation-container {
  padding: 0 0.75em;
}
.poll-limit-tab-content {
  margin-top: 0 !important;
}

.fa-exclamation-triangle {
  color: $danger;
}
</style>
