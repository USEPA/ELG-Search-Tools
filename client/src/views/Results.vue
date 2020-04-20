<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="is-size-4">
          Search Results
        </h1>
      </div>
      <div class="column">
        <router-link to="/" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </router-link>
      </div>
    </div>
    <Breadcrumbs
      :pages="[
        { title: 'Search', path: '/' },
        { title: 'Results', isCurrent: true },
      ]"
    />
    <h1 v-if="subcategoryData" class="is-size-3 has-text-weight-light">
      {{ selectedCategory.pointSourceCategoryCode }}: {{ selectedCategory.pointSourceCategoryName }}
    </h1>
    <h1 v-if="subcategoryData" class="is-size-5 has-text-weight-light">
      Subpart {{ subcategoryData.comboSubcategory }}
    </h1>
    <h1 v-if="pollutantData" class="is-size-3 has-text-weight-light">
      {{ pollutantData[0].pollutantDescription }}
    </h1>
    <h2 v-if="pollutantData">Number of PSCs Referencing Pollutant: {{ pollutantData.length }}</h2>
    <h1 v-if="treatmentTechnologyData" class="is-size-3 has-text-weight-light">
      {{ treatmentTechnologyData.name }}
    </h1>
    <div class="field is-grouped help-icons">
      <div v-if="pollutantData" class="field is-grouped psc-icon">
        <a @click="navigateToLimitationsForMultiplePscs(pollutantData[0])">
          <span class="fas fa-share-square"></span>Go to PSC Comparison
        </a>
      </div>
      <div class="field is-grouped">
        <span class="fas fa-book has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
      </div>
      <div class="field is-grouped help-container">
        <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
      </div>
    </div>
    <Tabs v-if="subcategoryData" :tabs="controlTechTabs" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template
        v-for="controlTechnology in subcategoryData.controlTechnologies"
        v-slot:[controlTechnology.controlTechnologyCode]
      >
        <div :key="controlTechnology.id" class="columns tab-content">
          <div class="column">
            <div class="field is-grouped">
              <div class="control is-expanded">
                <h1 class="is-size-6  has-text-weight-semibold">
                  {{ controlTechnology.controlTechnologyDescription }} ({{ controlTechnology.controlTechnologyCode }})
                  at a Glance
                </h1>
              </div>
              <div class="control">
                <a
                  class="is-link"
                  v-if="controlTechnology.notes && controlTechnology.notes.length > 0"
                  @click="shouldDisplayNotesModal(controlTechnology.notes)"
                  >Level of Control Notes</a
                >
              </div>
            </div>
            <div class="field" v-if="controlTechnology.atAGlance">
              <h1 class="is-size-6">{{ controlTechnology.atAGlance }}</h1>
            </div>
            <div class="field is-grouped">
              <p v-if="controlTechnology.technologyNames">
                <b>Treatment Technology(ies):</b> {{ abbreviatedList(controlTechnology.technologyNames) }}

                <a
                  class="is-link more"
                  v-if="controlTechnology.technologyNames.split(', ').length > 2"
                  @click="shouldDisplayTechnologiesModal(controlTechnology.technologyNames)"
                  >more</a
                >
              </p>
            </div>
            <div class="field is-grouped" v-if="controlTechnology.pollutants">
              <p>
                <b>Pollutant(s):</b> {{ abbreviatedList(controlTechnology.pollutants) }}
                <a
                  class="is-link more"
                  v-if="controlTechnology.pollutants.split(', ').length > 2"
                  @click="shouldDisplayPollutantsModal(controlTechnology.pollutants)"
                  >more</a
                >
              </p>
            </div>
            <div class="field">
              <Table
                v-if="controlTechnology.wastestreamProcesses"
                :columns="pscColumns"
                :rows="controlTechnology.wastestreamProcesses"
                @onDisplayInfoModal="displayInfoModal"
                :shouldHaveResultsCols="true"
                @onNavigateToLimitations="navigateToLimitations"
                @onDisplayCheckboxInfo="displayCheckboxInfo"
              />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
    <Table
      v-if="pollutantData"
      :columns="pollColumns"
      :rows="pollutantData"
      :shouldHavePollCols="true"
      :canComparePscs="true"
      @onNavigateToLimitations="navigateToLimitations"
      @shouldDisplayMoreModal="displayMoreModal"
      @onSelectedPsc="selectedPsc"
      :colsLength="6"
    />
    <div v-if="treatmentTechnologyData">
      <div class="columns treatment-info-box">
        <div class="column is-gray-background is-7 technology-description">
          <p><strong>Treatment Technology Description:</strong> {{ treatmentTechnologyData.description }}</p>
        </div>
        <div class="column is-gray-background is-5">
          <p><strong>Treatment Train(s):</strong></p>
          <ul class="elg-bullet-list">
            <li v-for="train in getTreatmentTrains" :key="train.id">{{ train.names }}</li>
          </ul>
          <a
            class="is-link more"
            v-if="treatmentTechnologyData.treatmentTrains.length > 3"
            @click="() => (shouldDisplayTrains = true)"
            >more</a
          >
        </div>
      </div>
      <div class="columns">
        <div class="column is-10">
          <strong><label for="treatmentTrains">Treatment Train:</label></strong>
          <select v-model="selectedTreatmentTrain" @change="getTreatmentTrainData($event)" id="treatmentTrains">
            <option v-for="train in treatmentTechnologyData.treatmentTrains" :key="train.id" :value="train.id">{{
              train.names
            }}</option>
          </select>
        </div>
      </div>
      <h2 v-if="treatmentTrain">Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}</h2>
      <div class="columns">
        <div class="column">
          <div v-if="treatmentTechnologyData" class="field is-grouped psc-icon">
            <a @click="shouldDisplayTechnologyBasisDataForMultiplePscs()">
              <span class="fas fa-share-square"></span>Go to PSC Comparison
            </a>
          </div>
        </div>
      </div>
      <Table
        v-if="treatmentTrain"
        :columns="techColumns"
        :rows="treatmentTrain"
        :shouldHaveTreatmentTechCols="true"
        :canComparePscs="true"
        @shouldDisplayMoreModal="displayMoreModal"
        @onShouldDisplayTechnologyBasisData="shouldDisplayTechnologyBasisData"
        @onSelectedPsc="selectedPscForTechnologyBasis"
      />
    </div>

    <Modal v-if="shouldDisplayNotes" @close="() => (shouldDisplayNotes = false)">
      <div class="control-notes" v-for="(note, index) in notes" :key="index">
        <h3><strong>CFR Section:</strong> {{ note.cfrSection }}</h3>
        <p><strong>Notes:</strong> {{ note.notes }}</p>
        <br />
      </div>
    </Modal>
    <Modal v-if="shouldDisplayInfoModal" @close="closeInfoModal">
      <div class="info-modal">
        <h3><strong>Description</strong></h3>
        <p>{{ currentRow.description }}</p>
        <hr v-if="currentRow.limitCalculationDescription" />
        <h3 v-if="currentRow.limitCalculationDescription"><strong>Limit Calculation Description</strong></h3>
        <p>{{ currentRow.limitCalculationDescription }}</p>
        <hr v-if="currentRow.notes" />
        <h3 v-if="currentRow.notes"><strong>Notes</strong></h3>
        <p>{{ currentRow.notes }}</p>
      </div>
    </Modal>
    <Modal v-if="shouldDisplayTechnologies" @close="() => (shouldDisplayTechnologies = false)">
      <p><strong>Technologies:</strong> {{ technologies }}</p>
    </Modal>
    <Modal v-if="shouldDisplayPollutants" @close="() => (shouldDisplayPollutants = false)">
      <p><strong>Pollutants:</strong> {{ pollutants }}</p>
    </Modal>
    <Modal v-if="shouldDisplayCheckboxModal" @close="() => (shouldDisplayCheckboxModal = false)">
      {{ currentCheckboxInfo }}
    </Modal>
    <Modal v-if="shouldDisplayMoreModal" @close="() => (shouldDisplayMoreModal = false)">
      <span v-html="currentMoreInfo"></span>
    </Modal>
    <Modal v-if="shouldDisplayTrains" @close="() => (shouldDisplayTrains = false)">
      <ul class="elg-bullet-list">
        <li v-for="train in treatmentTechnologyData.treatmentTrains" :key="train.id">
          {{ train.names }}
        </li>
      </ul>
    </Modal>
  </section>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Tabs from '@/components/shared/Tabs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { Breadcrumbs, Tabs, Table, Modal },
  computed: {
    ...get('search', [
      'selectedCategory',
      'subcategoryData',
      'pollutantData',
      'treatmentTechnologyData',
      'treatmentTrain',
    ]),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedTreatmentTrain']),
    controlTechTabs() {
      return [
        'BPT',
        'BAT',
        'BCT',
        'NSPS',
        'PSES',
        'PSNS',
        `About Part ${this.selectedCategory.pointSourceCategoryCode}`,
      ];
    },
    getTreatmentTrains() {
      if (this.treatmentTechnologyData.treatmentTrains.length > 3) {
        return this.treatmentTechnologyData.treatmentTrains.slice(0, 3);
      }
      return this.treatmentTechnologyData.treatmentTrains;
    },
  },
  data() {
    return {
      directLength: null,
      indirectLength: null,
      shouldDisplayNotes: false,
      notes: null,
      currentRow: null,
      shouldDisplayInfoModal: false,
      pollutants: null,
      technologies: null,
      shouldDisplayPollutants: false,
      shouldDisplayTechnologies: false,
      currentCheckboxInfo: null,
      shouldDisplayCheckboxModal: false,
      currentMoreInfo: null,
      shouldDisplayMoreModal: false,
      shouldDisplayTrains: false,
      selectedPscs: [],
      pscColumns: [
        {
          key: 'cfrSection',
          label: 'CFR Section',
        },
        {
          key: 'title',
          label: 'Process Operation/Wastestream',
        },
        {
          key: 'secondary',
          label: 'Other Process/Wastestream Detail(s)',
          displayAsHTML: true,
        },
      ],
      pollColumns: [
        {
          key: 'pointSourceCategoryCode',
          label: '40 CFR',
        },
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
        },
        {
          key: 'pointSourceSubcategories',
          label: 'Subcategories',
          isAbbreviatedList: true,
        },
        {
          key: 'rangeOfPollutantLimitations',
          label: 'Range of Pollutant Limitations',
          displayAsHTML: true,
        },
      ],
      techColumns: [
        {
          key: 'pointSourceCategoryCode',
          label: '40 CFR',
        },
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
        },
        {
          key: 'pointSourceSubcategories',
          label: 'Subcategories',
          isAbbreviatedList: true,
        },
        {
          key: 'wastestreamProcesses',
          label: 'Process Operation/Wastestream(s)',
          isAbbreviatedList: true,
        },
        {
          key: 'pollutants',
          label: 'Pollutants',
          isAbbreviatedList: true,
        },
      ],
    };
  },
  methods: {
    shouldDisplayNotesModal(notes) {
      this.notes = null;
      if (notes) {
        this.shouldDisplayNotes = true;
        this.notes = notes;
      }
    },
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    closeInfoModal() {
      this.currentRow = null;
      this.shouldDisplayInfoModal = false;
    },
    displayInfoModal(row) {
      this.currentRow = null;
      this.shouldDisplayInfoModal = true;
      this.currentRow = row;
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
        case 'bmps':
          this.currentCheckboxInfo =
            'Best Management Practices are included in the effluent limitations guidelines and standards for this process operation/wastestream.';
          this.shouldDisplayCheckboxModal = true;
          break;
        case 'alternativeReq':
          this.currentCheckboxInfo =
            'Indicates that a facility has more than one option to meet the effluent limitations guidelines and standards.';
          this.shouldDisplayCheckboxModal = true;
          break;
        case 'noLimitations':
          this.currentCheckboxInfo = 'EPA did not promulgate numeric or narrative pollutant limitations.';
          this.shouldDisplayCheckboxModal = true;
          break;
        default:
          break;
      }
    },
    abbreviatedList(value) {
      const shortList = value.split(', ');

      if (shortList.length >= 2) {
        return `${shortList[0]}, ${shortList[1]}`;
      }

      if (shortList.length === 1) {
        return value;
      }

      return '';
    },
    shouldDisplayTechnologiesModal(list) {
      this.technologies = null;
      if (list) {
        this.shouldDisplayTechnologies = true;
        this.technologies = list;
      }
    },
    shouldDisplayPollutantsModal(list) {
      this.pollutants = null;
      if (list) {
        this.shouldDisplayPollutants = true;
        this.pollutants = list;
      }
    },
    async navigateToLimitations(row) {
      if (row.id) {
        await this.$store.dispatch('limitations/getLimitationData', row.id);
      } else if (row.pollutantId) {
        await this.$store.dispatch('limitations/getPollLimitationData', {
          pollutantId: row.pollutantId,
          pointSourceCategoryCode: row.pointSourceCategoryCode,
        });
        await this.$store.dispatch('limitations/getPollutantInfo', {
          pointSourceCategoryCode: row.pointSourceCategoryCode,
          pointSourceCategoryName: row.pointSourceCategoryName,
          pollutantDescription: row.pollutantDescription,
        });
      }
      await this.$router.push('/results/limitations');
    },
    async selectedPsc(row, e) {
      if (e.target.checked) {
        // add this psc/pollutant combination to the selected list
        this.selectedPscs.push({ pollutantId: row.pollutantId, pointSourceCategoryCode: row.pointSourceCategoryCode });
      } else {
        // remove this psc/pollutant combination from the selected list
        this.selectedPscs = this.selectedPscs.filter(
          (psc) => !(psc.pollutantId === row.pollutantId && psc.pointSourceCategoryCode === row.pointSourceCategoryCode)
        );
      }
    },
    async navigateToLimitationsForMultiplePscs(row) {
      if (row.pollutantId) {
        await this.$store.dispatch('limitations/getPollLimitationDataForMultiplePscs', {
          pollutantIds: this.selectedPscs.map((psc) => psc.pollutantId).join(','),
          pointSourceCategoryCodes: this.selectedPscs.map((psc) => psc.pointSourceCategoryCode).join(','),
        });
        await this.$store.dispatch('limitations/getPollutantInfo', {
          pollutantDescription: row.pollutantDescription,
        });
      }
      await this.$router.push('/results/limitations');
    },
    displayMoreModal(value) {
      this.currentMoreInfo = null;
      this.currentMoreInfo = value;
      this.shouldDisplayMoreModal = true;
    },
    async getTreatmentTrainData(e) {
      await this.$store.dispatch('search/getTreatmentTrain', e.target.value);
    },
    async shouldDisplayTechnologyBasisData(row) {
      await this.$store.dispatch('search/getTechnologyBasisData', {
        treatmentId: row.treatmentId,
        pointSourceCategoryCode: row.pointSourceCategoryCode,
      });
      await this.$router.push('/results/technologyBasis');
    },
    async selectedPscForTechnologyBasis(row, e) {
      if (e.target.checked) {
        // add this psc/treatment combination to the selected list
        this.selectedPscs.push({ treatmentId: row.treatmentId, pointSourceCategoryCode: row.pointSourceCategoryCode });
      } else {
        // remove this psc/treatment combination from the selected list
        this.selectedPscs = this.selectedPscs.filter(
          (psc) => !(psc.treatmentId === row.treatmentId && psc.pointSourceCategoryCode === row.pointSourceCategoryCode)
        );
      }
    },
    async shouldDisplayTechnologyBasisDataForMultiplePscs() {
      await this.$store.dispatch('search/getTechnologyBasisDataForMultiplePscs', {
        treatmentIds: this.selectedPscs.map((psc) => psc.treatmentId).join(','),
        pointSourceCategoryCodes: this.selectedPscs.map((psc) => psc.pointSourceCategoryCode).join(','),
      });
      await this.$router.push('/reuslts/technologyBasis');
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

a.button {
  margin: 0;
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

section p {
  padding-bottom: 0 !important;
}

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}

.psc-icon {
  position: absolute;
  left: 0;
}

select {
  width: 54em;
}

.treatment-info-box {
  padding-left: 10px;
  margin-top: 10px;
}

.technology-description {
  margin-right: 5px;
}

.is-gray-background {
  background-color: $gray;
}
</style>
