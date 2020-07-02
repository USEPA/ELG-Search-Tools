<template>
  <div>
    <div v-if="treatmentTechnologyData">
      <div class="info-box-container message">
        <div class="message-body">
          <p><strong>Treatment Technology Description:</strong> {{ treatmentTechnologyData.description }}</p>
        </div>
      </div>
      <div class="columns">
        <div class="column is-4">
          <strong>
            <label for="categories">
              Point Source Categories
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
            @select="onChangeCategory"
            @remove="onChangeCategory"
          />
        </div>
        <div class="column is-4">
          <strong>
            <label for="pollutants">
              Pollutants
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
            @select="onChangePollutant"
            @remove="onChangePollutant"
          />
        </div>
        <div class="column is-4">
          <strong>
            <label for="treatmentTrains">
              Treatment Trains
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
            @select="onChangeTrain"
            @remove="onChangeTrain"
          />
        </div>
      </div>
      <p v-if="treatmentTrain" class="pollutant-subtext is-size-5">
        Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}
      </p>
      <NewTable v-if="treatmentLimitationData" :columns="limitationColumns" :rows="limitations" :busy="isFetching">
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
            <span v-html="item.wastestreamProcessSecondary" />
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
import HoverText from '@/components/shared/HoverText';
import NewTable from '@/components/shared/NewTable';
import Modal from '@/components/shared/Modal';

export default {
  components: { HoverText, NewTable, Modal, Multiselect },
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
          key: 'controlTechnologyCode',
          label: 'Level of Control',
        },
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'controlTechnologyCfrSection',
          label: 'CFR Section',
        },
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
        },
        {
          key: 'comboSubcategory',
          label: 'Subpart',
        },
        {
          key: 'wastestreamProcessTitle',
          label: 'Process',
        },
        {
          key: 'treatmentNames',
          label: 'Treatment Train',
        },
        /* {
          key: 'alternateLimitFlag',
          label: 'Flag',
        }, */
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
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
        },
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
