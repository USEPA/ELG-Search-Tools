<template>
  <section class="section">
    <div class="columns elg-breadcrumbs-container">
      <div class="column">
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Limitations', isCurrent: true },
          ]"
        />
      </div>
      <div class="column">
        <router-link to="/results" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </router-link>
      </div>
    </div>
    <div class="columns">
      <div class="column is-8">
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
    <div v-if="subcategoryData" class="info-box-container message">
      <div class="message-body">
        <p><span class="has-text-weight-bold">CFR Section:</span> {{ limitationData.cfrSection }}</p>
        <p><span class="has-text-weight-bold">Level of Control:</span> {{ limitationData.controlTechnologyCode }}</p>
        <p><span class="has-text-weight-bold">Process Operation/Wastestream:</span> {{ limitationData.title }}</p>
        <p>
          <span class="has-text-weight-bold">Other Process/Wastestream Details:</span>
          <span v-html="limitationData.secondary"></span>
        </p>
      </div>
    </div>
    <Table v-if="subcategoryData" :columns="pscColumns" :rows="limitationData.limitations">
      <template v-slot:head(limitationUnitBasis)="{ label }">
        {{ label }}
        <button
          class="button is-text icon-btn"
          @click.stop="
            openModal(
              '',
              'The Limitation Basis column is included as a tool to sort the numerical limitations in the ELG database. The ELG may require conversion of concentration-based to mass-based limitations. See the Type of Limitation information or CFR for more details.'
            )
          "
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:head(goToLta)="{ label }">
        {{ label }}
        <button
          class="button is-text icon-btn"
          @click.stop="openModal('', 'If no LTA data are available for the pollutant, no link will be shown.')"
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:cell(goToLta)="{ item }">
        <span v-if="item.longTermAverageCount > 0">
          <a @click="shouldDisplayLongTermAvgData(item)">
            <span class="fas fa-share-square limitation-link"></span>
          </a>
        </span>
        <span v-else>--</span>
      </template>
    </Table>
    <Modal v-if="shouldDisplayModal" :title="currentModalTitle" @close="shouldDisplayModal = false">
      <p class="has-text-left">
        <span v-html="currentModalContent" />
      </p>
    </Modal>
    <ControlTabs v-if="!subcategoryData && limitationData" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template v-for="controlTechnologyCode in controlTechTabs" v-slot:[controlTechnologyCode]>
        <div :key="controlTechnologyCode" class="tab-content poll-limit-tab-content">
          <div class="poll-limitation-container">
            <div class="field is-grouped download-icon-container">
              <span class="fas fa-download has-text-grey-dark help-icon"></span>
              <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Download Limitations (CSV File)</p>
            </div>
            <Table :columns="pollLimitationCols" :rows="getControlTechLimitations(controlTechnologyCode)">
              <template v-slot:cell(goToLta)="{ item }">
                <span v-if="item.longTermAverageCount > 0">
                  <a @click="shouldDisplayLongTermAvgData(item)">
                    <span class="fas fa-share-square limitation-link"></span>
                  </a>
                </span>
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
        <p>{{ currentRow.wastestreamProcessLimitCalculationDescription }}</p>
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
import { get, sync } from 'vuex-pathify';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
// import Table from '@/components/shared/Table';
import Table from '@/components/shared/Table';
import ControlTabs from '@/components/shared/ControlTabs';
import Modal from '@/components/shared/Modal';

export default {
  components: { Breadcrumbs, Table, ControlTabs, Modal },
  computed: {
    ...get('search', ['selectedCategory', 'subcategoryData']),
    ...get('limitations', [
      'limitationData',
      'pointSourceCategoryCode',
      'pointSourceCategoryName',
      'pollutantDescription',
      'treatmentNames',
      'isComparingPscs',
    ]),
    ...sync('results', ['activeTab']),
  },
  data() {
    return {
      shouldDisplayModal: false,
      currentModalTitle: null,
      currentModalContent: null,
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
        },
      ],
    };
  },
  methods: {
    openModal(title, content) {
      this.currentModalTitle = title;
      this.currentModalContent = content;
      this.shouldDisplayModal = true;
    },
    getPscs(data) {
      return data
        .map((row) => `${row.pointSourceCategoryCode}: ${row.pointSourceCategoryName}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');
    },
    async shouldDisplayLongTermAvgData(row) {
      await this.$store.dispatch('limitations/getLongTermAvgData', row.limitationId);
      await this.$router.push('/results/limitations/longTermAverage');
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

.info-box-container {
  margin-top: -1rem;
}

a.button {
  margin-bottom: 0;
}

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
}

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}

.download-icon-container {
  justify-content: flex-end;
  margin-bottom: 0;
}

.poll-limitation-container {
  padding: 0 0.75em;
}
.poll-limit-tab-content {
  margin-top: 0 !important;
}
</style>
