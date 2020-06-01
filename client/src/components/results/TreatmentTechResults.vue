<template>
  <div>
    <div v-if="treatmentTechnologyData">
      <div class="info-box-container message">
        <div class="message-body">
          <p><strong>Treatment Technology Description:</strong> {{ treatmentTechnologyData.description }}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column is-10">
          <strong><label for="treatmentTrains">Treatment Train:</label></strong>
          <Multiselect
            :value="selectedTreatmentTrain"
            :options="treatmentTechnologyData.treatmentTrains"
            placeholder="Select Treatment Train"
            label="names"
            @input="onChangeTreatmentTrain"
            class="results-select treatment-select"
          ></Multiselect>
        </div>
      </div>
      <p v-if="treatmentTrain" class="pollutant-subtext is-size-5">
        Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}
      </p>
      <div v-if="selectedTreatmentTrain && treatmentTechnologyData" class="field is-grouped">
        <a @click="shouldDisplayTechnologyBasisDataForMultiplePscs()">
          <span class="fas fa-share-square"></span>Go to PSC Comparison
        </a>
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
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Multiselect from 'vue-multiselect';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { Table, Modal, Multiselect },
  computed: {
    ...get('search', [
      'selectedCategory',
      'subcategories',
      'subcategoryData',
      'pollutantData',
      'treatmentTechnologyData',
      'treatmentTrain',
    ]),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedTreatmentTrain', 'selectedSubcategory']),
    getTreatmentTrains() {
      if (this.treatmentTechnologyData.treatmentTrains.length > 3) {
        return this.treatmentTechnologyData.treatmentTrains.slice(0, 3);
      }
      return this.treatmentTechnologyData.treatmentTrains;
    },
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
      selectedPscs: [],
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
    closeInfoModal() {
      this.currentRow = null;
      this.shouldDisplayInfoModal = false;
    },
    displayMoreModal(value) {
      this.currentMoreInfo = null;
      this.currentMoreInfo = value;
      this.shouldDisplayMoreModal = true;
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
    onChangeTreatmentTrain(value) {
      this.selectedTreatmentTrain = value;
      this.$store.dispatch('search/getTreatmentTrain', value.id);
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

.pollutant-subtext {
  margin-bottom: 1rem;
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
