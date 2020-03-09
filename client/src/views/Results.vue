<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <h1 class="is-size-4">
          Search Results
        </h1>
      </div>
      <div class="column">
        <button class="button has-text-white is-pulled-right" @click="onNavigate">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </button>
      </div>
    </div>
    <h1 v-if="subcategory" class="is-size-3 has-text-weight-light">
      {{ category.pointSourceCategoryCode }}: {{ category.pointSourceCategoryName }}
    </h1>
    <h1 v-if="subcategory" class="is-size-5 has-text-weight-light">Subpart {{ subcategory.comboSubcategory }}</h1>
    <h1 v-if="pollutantData" class="is-size-3 has-text-weight-light">
      {{ pollutantData[0].pollutantDescription }}
    </h1>
    <div class="field is-grouped help-icons">
      <div v-if="pollutantData" class="field is-grouped psc-icon">
        <a><span class="fas fa-share-square"></span>Go to PSC Comparison</a>
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
    <Tabs v-if="subcategory" :tabs="createTabs" :isPSC="true" :isPollutant="false">
      <template v-for="controlTechnology in subcategory.controlTechnologies" v-slot:[controlTechnology.id]>
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
                <b>Treatment Technology(ies):</b> {{ abbrvList(controlTechnology.technologyNames) }}

                <a
                  class="is-link more"
                  v-if="controlTechnology.technologyNames.split(';').length > 2"
                  @click="shouldDisplayTechnologiesModal(controlTechnology.technologyNames)"
                  >more</a
                >
              </p>
            </div>
            <div class="field is-grouped" v-if="controlTechnology.pollutants">
              <p>
                <b>Pollutant(s):</b> {{ abbrvList(controlTechnology.pollutants) }}
                <a
                  class="is-link more"
                  v-if="controlTechnology.pollutants.split(';').length > 2"
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
      @onNavigateToLimitations="navigateToLimitations"
      @shouldDisplayMoreModal="displayMoreModal"
      :colsLength="6"
    />
    <Modal v-if="shouldDisplayNotes" @close="() => (shouldDisplayNotes = false)">
      <div class="control-notes" v-for="(note, index) in notes" :key="index">
        <h3><strong>CFR Section:</strong> {{ note.cfrSection }}</h3>
        <p><strong>Notes:</strong> {{ note.notes }}</p>
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
      {{ currentMoreInfo }}
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Tabs from '@/components/shared/Tabs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { Tabs, Table, Modal },
  computed: {
    ...mapState('search', ['category', 'subcategory', 'pollutantData']),
    createTabs() {
      const tabs = [
        {
          id: 5,
          controlTechnologyCode: 'BPT',
        },
        {
          id: 6,
          controlTechnologyCode: 'BAT',
        },
        {
          id: 7,
          controlTechnologyCode: 'BCT',
        },
        {
          id: 8,
          controlTechnologyCode: 'NSPS',
        },
        {
          id: 9,
          controlTechnologyCode: 'PSES',
        },
        {
          id: 10,
          controlTechnologyCode: 'PSNS',
        },
        {
          id: 11,
          controlTechnologyCode: `About Part ${this.category.pointSourceCategoryCode}`,
        },
      ];
      if (this.subcategory) {
        return tabs.map(
          (tab) =>
            this.subcategory.controlTechnologies.find((c) => c.controlTechnologyCode === tab.controlTechnologyCode) ||
            tab
        );
      }
      return tabs;
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
        },
        {
          key: 'wastestreamProcesses',
          label: 'Process Operation/Wastestream(s)',
        },
      ],
    };
  },
  methods: {
    onNavigate() {
      this.$router.push('/');
    },
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
    abbrvList(value) {
      let abbrv = '';
      const shortList = value.split(';');
      if (shortList.length >= 2) {
        abbrv = `${shortList[0]}; ${shortList[1]}`;
      } else if (shortList.length === 1) {
        return value;
      }
      return abbrv;
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
      await this.$router.push('limitations');
    },
    displayMoreModal(value) {
      this.currentMoreInfo = null;
      this.currentMoreInfo = value;
      this.shouldDisplayMoreModal = true;
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
</style>
