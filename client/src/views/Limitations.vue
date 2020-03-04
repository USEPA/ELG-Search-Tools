<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3 has-text-black">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="columns" v-if="!subcategory && limitationData">
      <div class="column">
        <button class="button has-text-white is-pulled-right" @click="onNavigate">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </button>
      </div>
    </div>
    <h1 v-if="subcategory" class="is-size-3 has-text-black has-text-weight-light">
      {{ category.pointSourceCategoryCode }}: {{ category.pointSourceCategoryName }}
    </h1>
    <h1 v-if="!subcategory && limitationData" class="is-size-3 has-text-black has-text-weight-light">
      {{ pollutantDescription }}
    </h1>
    <h1 v-if="!subcategory && limitationData" class="is-size-5 has-text-black has-text-weight-light">
      {{ pointSourceCategoryCode }}: {{ pointSourceCategoryName }}
    </h1>
    <h1 v-if="subcategory" class="is-size-5 has-text-black has-text-weight-light">
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
    <div v-if="subcategory" class="content info-box-container">
      <div class="columns">
        <div class="column is-9">
          <p class="has-text-black info-box"><strong>CRF Section:</strong> {{ limitationData.cfrSection }}</p>
          <p class="has-text-black info-box">
            <strong>Level of Control:</strong> {{ limitationData.controlTechnologyCode }}
          </p>
          <p class="has-text-black info-box">
            <strong>Primary Wastestream/Process Operation:</strong> {{ limitationData.title }}
          </p>
          <p class="has-text-black info-box">
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
      v-if="subcategory"
      :columns="pscColumns"
      :rows="limitationData.limitations"
      :shouldHaveLimitationCols="true"
      @onDisplayUnitDescriptionModal="displayUnitDescriptionModal"
    />
    <Tabs
      v-if="!subcategory && limitationData"
      :tabs="uniqueTabs"
      :directLength="directLength"
      :indirectLength="indirectLength"
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
              />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
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
      this.uniqueTabs = null;
      this.uniqueTabs = [...new Set(this.limitationData.map((item) => item.controlTechnologyCode))];
      this.uniqueTabs = this.uniqueTabs.map((u) => {
        const obj = {};
        obj.controlTechnologyCode = u;
        obj.id = this.uniqueTabs.indexOf(u);
        obj.limitations = this.limitationData.filter((l) => l.controlTechnologyCode === u);
        return obj;
      });
      if (this.uniqueTabs.length === 6) {
        this.directLength = '472px';
      } else {
        this.directLength = `${118 *
          this.uniqueTabs.filter(
            (c) =>
              c.controlTechnologyCode === 'BPT' ||
              c.controlTechnologyCode === 'BCT' ||
              c.controlTechnologyCode === 'BAT' ||
              c.controlTechnologyCode === 'NSPS'
          ).length}px`;
        this.indirectLength = `${118 *
          this.uniqueTabs.filter((c) => c.controlTechnologyCode === 'PSES' || c.controlTechnologyCode === 'PSNS')
            .length}px`;
      }
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
        /*
        {
          key: 'minimumValue',
          label: 'Minimum Level',
        },
        {
          key: 'maximumValue',
          label: 'Maximum Level',
        },
        */
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
    };
  },
  methods: {
    onNavigate() {
      this.$router.push('/results');
    },
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    displayCheckboxInfo(checkbox) {
      this.shouldDisplayCheckboxModal = false;
      this.currentCheckboxInfo = null;
      switch (checkbox) {
        case 'zeroDischarge':
          this.currentCheckboxInfo =
            'There will be no discharge from the process operation or no discharge of the wastestream.';
          this.shouldDisplayCheckboxModal = true;
          break;
        default:
          break;
      }
    },
    displayUnitDescriptionModal(row) {
      this.currentRow = null;
      this.shouldDisplayUnitDescriptionModal = true;
      this.currentRow = row;
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
