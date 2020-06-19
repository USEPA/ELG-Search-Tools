<template>
  <div>
    <div class="columns psc-select">
      <div class="column">
        <label class="sr-only" for="subcategory">Subpart</label>
        <Multiselect
          :value="selectedSubcategory"
          :options="subcategories"
          placeholder="Select Subcategory"
          label="comboSubcategory"
          :custom-label="(option) => 'Subpart ' + option.comboSubcategory"
          @input="onChangeSubcategory"
          class="results-select"
        />
      </div>
      <div class="column cfr-link">
        <router-link :to="{ path: '/results/about-cfr', query: { psc: selectedCategory.pointSourceCategoryCode } }">
          About 40 CFR {{ selectedCategory.pointSourceCategoryCode }}
          <span class="fa fa-external-link-alt" />
        </router-link>
      </div>
    </div>

    <ControlTabs :activeTab="activeTab" @onTabClick="changeControlTechTab">
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
                <span class="has-text-weight-bold">Pollutant(s):</span>
                {{ abbreviatedList(controlTechnology.pollutants) }}
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
    </ControlTabs>

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
      <span v-html="currentMoreInfo" />
    </Modal>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Multiselect from 'vue-multiselect';
import ControlTabs from '@/components/shared/ControlTabs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { ControlTabs, Table, Modal, Multiselect },
  computed: {
    ...get('search', ['selectedCategory', 'subcategories', 'subcategoryData']),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedSubcategory']),
  },
  data() {
    return {
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
          displayAsHTML: true,
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
      this.$router.push('/results/limitations');
    },
    changeControlTechTab(tabId) {
      this.activeTab = tabId;
    },
    onChangeSubcategory(value) {
      this.selectedSubcategory = value;
      this.$store.dispatch('search/getSubcategoryData');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
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

.psc-select {
  margin-bottom: 1rem;
}

.results-select {
  display: inline-block;
  width: auto;
  min-width: 500px;

  &.treatment-select {
    min-width: 650px;
    margin-bottom: 0;
    margin-left: 0.5rem;
  }
}

.info-box-container {
  height: 100%;
  margin-bottom: 0;
}

.technology-description {
  margin-right: 5px;
}

.is-gray-background {
  background-color: $gray;
}
</style>
