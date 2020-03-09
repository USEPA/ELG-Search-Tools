<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="columns" v-if="!subcategory && limitationData && !currentLongTermAvgData">
      <div class="column">
        <button class="button has-text-white is-pulled-right" @click="onNavigate">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </button>
      </div>
    </div>
    <h1 v-if="subcategory && !currentLongTermAvgData" class="is-size-3 has-text-weight-light">
      {{ category.pointSourceCategoryCode }}: {{ category.pointSourceCategoryName }}
    </h1>
    <h1 v-if="!subcategory && limitationData && !currentLongTermAvgData" class="is-size-3 has-text-weight-light">
      {{ pollutantDescription }}
    </h1>
    <h1 v-if="!subcategory && limitationData && !currentLongTermAvgData" class="is-size-5 has-text-weight-light">
      {{ pointSourceCategoryCode }}: {{ pointSourceCategoryName }}
    </h1>
    <h1 v-if="subcategory && !currentLongTermAvgData" class="is-size-5 has-text-weight-light">
      Subpart {{ subcategory.comboSubcategory }}
    </h1>
    <div class="field is-grouped help-icons">
      <div class="field is-grouped">
        <span class="fas fa-book has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
      </div>
      <div class="field is-grouped help-container">
        <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
      </div>
    </div>
    <div v-if="subcategory && !currentLongTermAvgData" class="content info-box-container">
      <div class="columns">
        <div class="column is-9">
          <p class="info-box"><strong>CRF Section:</strong> {{ limitationData.cfrSection }}</p>
          <p class="info-box"><strong>Level of Control:</strong> {{ limitationData.controlTechnologyCode }}</p>
          <p class="info-box"><strong>Primary Wastestream/Process Operation:</strong> {{ limitationData.title }}</p>
          <p class="info-box">
            <strong>Secondary Wastestream/Process Operation(s):</strong>
            <span v-html="limitationData.secondary"></span>
          </p>
        </div>
        <div class="column">
          <button class="button has-text-white is-pulled-right" @click="onNavigate">
            <span class="fa fa-reply has-text-white"></span>Back to Results
          </button>
        </div>
      </div>
    </div>
    <Table
      v-if="subcategory && !currentLongTermAvgData"
      :columns="pscColumns"
      :rows="limitationData.limitations"
      :shouldHaveLimitationCols="true"
      @onDisplayUnitDescriptionModal="displayUnitDescriptionModal"
      @onShouldDisplayPSCLongTermAvgData="shouldDisplayPSCLongTermAvgData"
      @onDisplayCheckboxInfo="displayCheckboxInfo"
    />
    <Tabs
      v-if="!subcategory && !currentLongTermAvgData && limitationData"
      :tabs="uniqueTabs"
      :isPollutant="true"
      :isPSC="false"
    >
      <template v-for="controlTechnology in uniqueTabs" v-slot:[controlTechnology.id]>
        <div :key="controlTechnology.id" class="columns tab-content poll-limit-tab-content">
          <div class="column poll-limitation-container">
            <div class="field is-grouped download-icon-container">
              <span class="fas fa-download has-text-grey-dark help-icon"></span>
              <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Download Limitations (CSV File)</p>
            </div>
            <div class="field">
              <Table
                :columns="pollLimitationCols"
                :rows="controlTechnology.limitations"
                :shouldHavePollLimitCols="true"
                @onDisplayCheckboxInfo="displayCheckboxInfo"
                @onDisplayUnitDescriptionModal="displayUnitDescriptionModal"
                @onShouldDisplayPollLongTermAvgData="shouldDisplayPollLongTermAvgData"
                :colsLength="10"
              />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
    <div v-if="currentLongTermAvgData" class="content info-box-container">
      <div class="columns">
        <div class="column is-8">
          <h1 class="info-box">{{ currentLongTermAvgData.pollutantDescription }}</h1>
          <p class="info-box">Control Technology: {{ currentLongTermAvgData.controlTechnologyCode }}</p>
          <p class="info-box">
            Part {{ currentLongTermAvgData.pointSourceCategoryCode }}:
            {{ currentLongTermAvgData.pointSourceCategoryName }}
          </p>
          <p class="info-box">Subpart {{ currentLongTermAvgData.comboSubcategory }}</p>
          <p class="info-box">
            Process Operation/Wastestream: {{ currentLongTermAvgData.wastestreamProcessCfrSection }}
            {{ currentLongTermAvgData.wastestreamProcessTitle }}
          </p>
          <p class="info-box">
            Other Process Operation/Wastestream Detail(s): {{ currentLongTermAvgData.wastestreamProcessSecondary }}
          </p>
        </div>
        <div class="column">
          <button class="button has-text-white is-pulled-right" @click="onNavigateLimitations">
            <span class="fa fa-reply has-text-white"></span>Back to Limitations
          </button>
        </div>
      </div>
    </div>
    <Table v-if="currentLongTermAvgData" :columns="longTermAvgCols" :rows="currentLongTermAvgData.longTermAverages" />
    <Modal v-if="shouldDisplayCheckboxModal" @close="() => (shouldDisplayCheckboxModal = false)">
      {{ currentCheckboxInfo }}
    </Modal>
    <Modal v-if="shouldDisplayUnitDescriptionModal" @close="() => (shouldDisplayUnitDescriptionModal = false)">
      <div class="info-modal">
        <h3 v-if="currentRow.limitationUnitDescription"><strong>Limitation Unit Description</strong></h3>
        <p>{{ currentRow.limitationUnitDescription }}</p>
      </div>
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Table from '@/components/shared/Table';
import Tabs from '@/components/shared/Tabs';
import Modal from '@/components/shared/Modal';

export default {
  beforeMount() {
    if (!this.subcategory && this.limitationData) {
      this.uniqueTabs = [
        {
          id: 0,
          controlTechnologyCode: 'BPT',
        },
        {
          id: 1,
          controlTechnologyCode: 'BAT',
        },
        {
          id: 2,
          controlTechnologyCode: 'BCT',
        },
        {
          id: 3,
          controlTechnologyCode: 'NSPS',
        },
        {
          id: 4,
          controlTechnologyCode: 'PSES',
        },
        {
          id: 5,
          controlTechnologyCode: 'PSNS',
        },
      ];

      this.uniqueTabs.map((tab) => {
        tab.limitations = this.limitationData.filter((l) => l.controlTechnologyCode === tab.controlTechnologyCode);
        return tab;
      });
    }
  },
  components: { Table, Tabs, Modal },
  computed: {
    ...mapState('search', ['category', 'subcategory']),
    ...mapState('limitations', [
      'limitationData',
      'pointSourceCategoryCode',
      'pointSourceCategoryName',
      'pollutantDescription',
      'pollLongTermAvgData',
      'pscLongTermAvgData',
    ]),
  },
  data() {
    return {
      shouldDisplayUnitDescriptionModal: false,
      directLength: null,
      indirectLength: null,
      currentCheckboxInfo: null,
      shouldDisplayCheckboxModal: false,
      uniqueTabs: null,
      currentLongTermAvgData: null,
      pscColumns: [
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'limitationDurationDescription',
          label: 'Type of Limitation',
        },
        {
          key: 'dischargeFrequency',
          label: 'Frequency',
        },
        {
          key: 'alternateLimitFlag',
          label: 'Flag',
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
        },
      ],
      pollLimitationCols: [
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
        },
        {
          key: 'limitationDurationDescription',
          label: 'Type of Limitation',
        },
        {
          key: 'dischargeFrequency',
          label: 'Frequency',
        },
        {
          key: 'alternativeLimitFlag',
          label: 'Flag',
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Basis',
        },
      ],
      longTermAvgCols: [
        {
          key: 'Treatment Train',
          label: 'Treatment Train',
        },
        {
          key: 'Pollutant',
          label: 'Pollutant',
        },
        {
          key: 'LTA Value',
          label: 'LTA Value',
        },
        {
          key: 'Basis',
          label: 'Basis',
        },
        {
          key: 'LTA Notes',
          label: 'LTA Notes',
        },
        {
          key: 'LTA Reference',
          label: 'LTA Reference',
        },
      ],
    };
  },
  methods: {
    onNavigate() {
      this.$router.push('/results');
    },
    onNavigateLimitations() {
      this.$store.commit('limitations/SET_PSC_LTA_DATA', null);
      this.$store.commit('limitations/SET_POLL_LTA_DATA', null);
      this.currentLongTermAvgData = null;
    },
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    displayCheckboxInfo(checkbox) {
      this.shouldDisplayCheckboxModal = false;
      this.currentCheckboxInfo = null;
      if (checkbox === 'zeroDischarge') {
        this.currentCheckboxInfo =
          'There will be no discharge from the process operation or no discharge of the wastestream.';
        this.shouldDisplayCheckboxModal = true;
      }
    },
    displayUnitDescriptionModal(row) {
      this.currentRow = null;
      this.shouldDisplayUnitDescriptionModal = true;
      this.currentRow = row;
    },
    async shouldDisplayPollLongTermAvgData(row) {
      this.currentLongTermAvgData = null;
      await this.$store.dispatch('limitations/getPollLongTermAvgData', row.limitationId);
      this.currentLongTermAvgData = this.pollLongTermAvgData;
    },
    async shouldDisplayPSCLongTermAvgData(row) {
      this.currentLongTermAvgData = null;
      await this.$store.dispatch('limitations/getPSCLongTermAvgData', row.limitationId);
      this.currentLongTermAvgData = this.pscLongTermAvgData;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';
button {
  background: $blue;
}

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
}

.help-icon {
  font-size: 20px;
  margin-right: 5px;
}

.help-icons {
  justify-content: flex-end;
  margin-bottom: 0;
}

.help-container {
  margin-left: 20px;
}

.info-box {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}

.info-box-container {
  background-color: $gray !important;
  padding: 20px !important;
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
