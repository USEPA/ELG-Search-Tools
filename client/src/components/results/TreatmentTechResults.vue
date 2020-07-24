<template>
  <div>
    <div v-if="treatmentTechnologyData">
      <div class="info-box-container message">
        <div class="message-body">
          <p><strong>Treatment Technology Description:</strong> {{ treatmentTechnologyData.description }}</p>
        </div>
      </div>
    </div>
    <Alert type="warning">
      Disclaimer: The ELG Database is populated with readily-available information on the technology basis to develop
      the requirements. Not all Point Source Categories, Level of Control, or Process Operations/Wastestreams (Process)
      will have an associated technology basis.
    </Alert>
    <div v-if="treatmentTechnologyData">
      <Alert type="info">
        Instructions: The numbers in parentheses next to the Point Source Categories, Pollutants, and Treatment Trains
        dropdown menu titles indicate the total number of records in the ELG Database related to the selected treatment
        technology for that search criteria. From the dropdown menus, select one or more criteria to view the search
        results, including Point Source Category(ies), Pollutant(s), and Treatment Train(s). The table below will
        automatically update after each criterion is selected. Click the “x” next to a criterion to remove it from the
        search results. If EPA was able to readily identify the associated pollutant limitation’s long-term average
        (LTA) an arrow will be displayed in the “Go to LTA” column. Click on this arrow to Select the arrow in the “Go
        to LTA” column to navigate to the long-term average information.
      </Alert>
      <div class="columns">
        <div class="column is-4">
          <strong>
            <label for="categories">
              Point Source Categories ({{ treatmentTechnologyData.pointSourceCategories.length }})
              <HoverText hoverId="catInfo" :icon="true">
                The above technology is associated with a treatment train to control the discharge of pollutants for the
                following PSCs.
              </HoverText>
            </label>
          </strong>
          <Multiselect
            id="categories"
            :value="selectedTreatmentCategory"
            :options="treatmentTechnologyData.pointSourceCategories"
            :multiple="true"
            placeholder="Select Category"
            label="pointSourceCategoryName"
            select-label=""
            deselect-label=""
            @select="onChangeCategory"
            @remove="onChangeCategory"
          />
        </div>
        <div class="column is-4">
          <strong>
            <label for="pollutants">
              Pollutants ({{ treatmentTechnologyData.pollutants.length }})
              <HoverText hoverId="pollInfo" :icon="true">
                The above technology is associated with a treatment train to control the discharge of the following
                pollutants.
              </HoverText>
            </label>
          </strong>
          <Multiselect
            id="pollutants"
            :value="selectedTreatmentPollutant"
            :options="treatmentTechnologyData.pollutants"
            :multiple="true"
            placeholder="Select Pollutant"
            label="pollutantDescription"
            select-label=""
            deselect-label=""
            @select="onChangePollutant"
            @remove="onChangePollutant"
          />
        </div>
        <div class="column is-4">
          <strong>
            <label for="treatmentTrains">
              Treatment Trains ({{ treatmentTechnologyData.treatmentTrains.length }})
              <HoverText hoverId="trainInfo" :icon="true">
                The above technology is associated with the following treatment trains.
              </HoverText>
            </label>
          </strong>
          <Multiselect
            id="treatmentTrains"
            :value="selectedTreatmentTrain"
            :options="treatmentTechnologyData.treatmentTrains"
            :multiple="true"
            placeholder="Select Treatment Train"
            label="names"
            select-label=""
            deselect-label=""
            @select="onChangeTrain"
            @remove="onChangeTrain"
          />
        </div>
      </div>
      <p v-if="treatmentTrain" class="pollutant-subtext is-size-5">
        Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}
      </p>
      <NewTable
        v-if="treatmentLimitationData"
        :columns="limitationColumns"
        :rows="limitations"
        :busy="isFetching"
        :perPage="100"
      >
        <template v-slot:cell(limitationValue)="{ item }">
          {{ item.alternateLimitFlag }} {{ item.limitationValue }}
        </template>
        <template v-slot:cell(limitationUnitCode)="{ item }">
          <HoverText
            :hoverId="`units${item.limitationId}`"
            :linkText="item.limitationUnitCode"
            :customStyle="{ width: '200px' }"
          >
            {{ item.limitationUnitDescription }}
          </HoverText>
        </template>
        <template v-slot:cell(wastestreamProcessTitle)="{ item }">
          <HoverText
            :hoverId="`process${item.limitationId}`"
            :linkText="item.wastestreamProcessTitle"
            :customStyle="{ width: '300px' }"
          >
            <span v-html="item.wastestreamProcessDescription" />
          </HoverText>
        </template>
        <template v-slot:cell(treatmentNames)="{ item }">
          <HoverText
            :hoverId="`process${item.limitationId}`"
            :linkText="item.treatmentNames"
            :customStyle="{ width: '300px' }"
          >
            <span
              v-html="
                item.wastestreamProcessTreatmentTechnologyNotes +
                  ' (' +
                  item.wastestreamProcessTreatmentTechnologySourceTitle +
                  ')'
              "
            />
          </HoverText>
        </template>
        <template v-slot:cell(limitationDurationBaseType)="{ item }">
          <HoverText
            :hoverId="`limitationType${item.limitationId}`"
            :linkText="item.limitationDurationBaseType"
            :customStyle="{ width: '200px' }"
          >
            {{ item.limitationDurationDescription }}
          </HoverText>
        </template>
        <template v-slot:cell(goToLta)="{ item }">
          <span v-if="item.longTermAverageCount > 0">
            <a @click="onShouldDisplayLongTermAvgData(item.limitationId)">
              <span class="fas fa-share-square limitation-link"></span>
            </a>
          </span>
        </template>
      </NewTable>
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
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Multiselect from 'vue-multiselect';
import xor from 'lodash/xor';
import Alert from '@/components/shared/Alert';
import HoverText from '@/components/shared/HoverText';
import NewTable from '@/components/shared/NewTable';
import Modal from '@/components/shared/Modal';

export default {
  components: { Alert, HoverText, NewTable, Modal, Multiselect },
  computed: {
    ...get('search', [
      'selectedCategory',
      'subcategories',
      'subcategoryData',
      'pollutantData',
      'treatmentTechnologyData',
      'treatmentTrain',
    ]),
    ...get('limitations', ['treatmentLimitationData']),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedSubcategory']),
    ...sync('limitations', [
      'isFetching',
      'selectedTreatmentTrain',
      'selectedTreatmentCategory',
      'selectedTreatmentPollutant',
    ]),
    limitations() {
      return this.treatmentLimitationData.map((row) => {
        return {
          ...row,
          limitationValue:
            row.limitationValue !== null ? row.limitationValue : `${row.minimumValue} - ${row.maximumValue}`,
        };
      });
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
      limitationColumns: [
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
        },
        {
          key: 'controlTechnologyCfrSection',
          label: 'CFR Section',
        },
        {
          key: 'comboSubcategory',
          label: 'Subpart',
        },
        {
          key: 'controlTechnologyCode',
          label: 'Level of Control',
        },
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'wastestreamProcessTitle',
          label: 'Process',
        },
        {
          key: 'treatmentNames',
          label: 'Treatment Train',
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
          key: 'limitationDurationBaseType',
          label: 'Type of Limitation',
        },
        // {
        //   key: 'limitationUnitBasis',
        //   label: 'Limitation Basis',
        // },
        {
          key: 'limitationDurationBaseType',
          label: 'Statistical Base',
        },
        {
          key: 'goToLta',
          label: 'Go To LTA',
        },
      ],
    };
  },
  methods: {
    closeInfoModal() {
      this.currentRow = null;
      this.shouldDisplayInfoModal = false;
    },
    onChangeTrain(value) {
      this.selectedTreatmentTrain = xor(this.selectedTreatmentTrain, [value]);
      this.$store.dispatch('limitations/getTreatmentTechnologyLimitations');
    },
    onChangeCategory(value) {
      this.selectedTreatmentCategory = xor(this.selectedTreatmentCategory, [value]);
      this.$store.dispatch('limitations/getTreatmentTechnologyLimitations');
    },
    onChangePollutant(value) {
      this.selectedTreatmentPollutant = xor(this.selectedTreatmentPollutant, [value]);
      this.$store.dispatch('limitations/getTreatmentTechnologyLimitations');
    },
    onShouldDisplayLongTermAvgData(limitationId) {
      this.$store.dispatch('limitations/getLongTermAvgDataTechSearch', limitationId);
      this.$router.push('/results/limitations/longTermAverage');
    },
  },
  // TODO: add back in when pagination is handled on the back-end
  // mounted() {
  //   this.$store.dispatch('limitations/getTreatmentTechnologyLimitations');
  // },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.button {
  width: 100%;
  margin-top: 0.5rem;

  &[disabled] {
    background-color: whitesmoke;
    color: inherit;

    &:hover {
      background-color: #fff;
    }
  }
}

a .fa {
  font-size: 1.25rem;
}

.pollutant-subtext {
  margin-bottom: 1rem;
}

section p {
  padding-bottom: 0 !important;
}

.info-box-container {
  height: 100%;
  margin-bottom: 1rem;
}
</style>
