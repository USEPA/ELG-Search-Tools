<template>
  <div>
    <div v-if="multiCriteriaResults">
      <div class="info-box-container message">
        <div class="message-body">
          <p v-if="multiCriteriaResults.pointSourceCategoryDisplay">
            <strong>Point Source Category:</strong> {{ multiCriteriaResults.pointSourceCategoryDisplay }}
          </p>
          <p v-if="multiCriteriaResults.sicCodeDisplay">
            <strong>NAICS Code:</strong> {{ multiCriteriaResults.sicCodeDisplay }}
          </p>
          <p v-if="multiCriteriaResults.naicsCodeDisplay">
            <strong>SIC Code:</strong> {{ multiCriteriaResults.naicsCodeDisplay }}
          </p>
          <p v-if="multiCriteriaResults.pollutantDisplay">
            <strong>Pollutant:</strong> {{ multiCriteriaResults.pollutantDisplay }}
          </p>
          <p v-if="multiCriteriaResults.pollutantGroupDisplay">
            <strong>Pollutant Category:</strong> {{ multiCriteriaResults.pollutantGroupDisplay }}
          </p>
          <p v-if="multiCriteriaResults.limitationRangeDisplay">
            <strong>Limitation Range:</strong> {{ multiCriteriaResults.limitationRangeDisplay }}
          </p>
          <p v-if="multiCriteriaResults.treatmentTechnologyDisplay">
            <strong>Treatment Technology:</strong> {{ multiCriteriaResults.treatmentTechnologyDisplay }}
          </p>
          <p v-if="multiCriteriaResults.treatmentTechnologyGroupDisplay">
            <strong>Treatment Technology Category:</strong> {{ multiCriteriaResults.treatmentTechnologyGroupDisplay }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="multiCriteriaResults">
      <Alert type="info" :isSlim="true">
        <strong>Instructions:</strong> The numbers in parentheses next to the Point Source Categories, Pollutants, and
        Treatment Trains dropdown menu titles indicate the total number of records in the ELG Database related to the
        selected search criteria. From the dropdown menus, select one or more criteria to view the search results,
        including Point Source Category(ies), Pollutant(s), and Treatment Train(s). The table below will automatically
        update after each criterion is selected. Click the “x” next to a criterion to remove it from the search results.
        If EPA was able to readily identify the associated pollutant limitation’s long-term average (LTA) an arrow will
        be displayed in the “Go to LTA” column. Click on this arrow to navigate to the long-term average information.
      </Alert>
      <div class="columns">
        <div class="column is-4">
          <strong>
            <label for="categories">
              Point Source Categories ({{ multiCriteriaResults.pointSourceCategories.length }})
            </label>
          </strong>
          <VueSelect
            id="categories"
            v-model="filterPointSourceCategoryCode"
            :options="sortBy(multiCriteriaResults.pointSourceCategories, ['pointSourceCategoryCode'])"
            :multiple="true"
            placeholder="Select Category"
            label="pointSourceCategoryName"
            :reduce="(o) => o.pointSourceCategoryCode"
            @input="getMultiCriteriaResults"
          >
            <template #option="option">
              {{ option.pointSourceCategoryCode }}: {{ option.pointSourceCategoryName }}
            </template>
            <template #selected-option="option">
              {{ option.pointSourceCategoryCode }}: {{ option.pointSourceCategoryName }}
            </template>
          </VueSelect>
        </div>
        <div class="column is-4">
          <strong>
            <label for="pollutants"> Pollutants ({{ multiCriteriaResults.pollutants.length }}) </label>
          </strong>
          <VueSelect
            id="pollutants"
            v-model="filterPollutantId"
            :options="multiCriteriaResults.pollutants"
            :multiple="true"
            placeholder="Select Pollutant"
            label="pollutantDescription"
            :reduce="(o) => o.pollutantId"
            @input="getMultiCriteriaResults"
          />
        </div>
        <div class="column is-4">
          <strong>
            <label for="treatmentTrains"> Treatment Trains ({{ multiCriteriaResults.treatmentTrains.length }}) </label>
          </strong>
          <VueSelect
            id="treatmentTrains"
            v-model="filterTreatmentId"
            :options="multiCriteriaResults.treatmentTrains"
            :multiple="true"
            placeholder="Select Treatment Train"
            label="names"
            :reduce="(o) => o.id"
            @input="getMultiCriteriaResults"
          />
        </div>
      </div>
      <p v-if="treatmentTrain" class="pollutant-subtext is-size-5">
        Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}
      </p>
      <DownloadLink v-else title="Limitations" :url="multiCriteriaDownloadUrl" />
      <Table
        v-if="multiCriteriaResults"
        :columns="limitationColumns"
        :rows="limitations"
        :busy="isFetching"
        :perPage="100"
      >
        <template v-slot:cell(wastestreamProcessTitle)="{ index, item }">
          {{ item.wastestreamProcessTitle }}
          <button class="button is-text icon-btn" @click="shouldDisplayProcess = index">
            <span class="fa fa-info-circle"></span>
          </button>
          <Modal v-if="shouldDisplayProcess === index" title="Description" @close="shouldDisplayProcess = false">
            <p class="has-text-left">
              <span v-html="item.wastestreamProcessDescription" />
            </p>
          </Modal>
        </template>
        <template v-slot:cell(treatmentNames)="{ index, item }">
          {{ item.treatmentNames }}
          <button
            class="button is-text icon-btn"
            @click="shouldDisplayNotes = index"
            title="Click to view Treatment Train Notes"
          >
            <span class="fa fa-info-circle"></span>
          </button>
          <Modal v-if="shouldDisplayNotes === index" title="Treatment Train Notes" @close="shouldDisplayNotes = false">
            <p class="has-text-left">
              <span
                v-html="
                  item.wastestreamProcessTreatmentTechnologyNotes +
                    ' (' +
                    item.wastestreamProcessTreatmentTechnologySourceTitle +
                    ')'
                "
              />
            </p>
          </Modal>
        </template>
        <template v-slot:cell(goToLta)="{ item }">
          <span v-if="item.longTermAverageCount > 0">
            <a @click="onShouldDisplayLongTermAvgData(item.limitationId)">
              <span class="fas fa-share-square limitation-link"></span>
            </a>
          </span>
          <span v-else>--</span>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import { call, get, sync } from 'vuex-pathify';
import sortBy from 'lodash/sortBy';
import Alert from '@/components/shared/Alert';
import HoverText from '@/components/shared/HoverText';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';
import DownloadLink from '@/components/shared/DownloadLink';

export default {
  components: { Alert, HoverText, Table, Modal, DownloadLink },
  computed: {
    ...get('search', [
      'selectedCategory',
      'subcategories',
      'subcategoryData',
      'pollutantData',
      'treatmentTechnologyData',
      'treatmentTrain',
      'selectedTreatmentTechnology',
      'selectedTreatmentTechnologyCategory',
    ]),
    ...get('customSearch', ['multiCriteriaResults', 'multiCriteriaDownloadUrl']),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedSubcategory']),
    ...sync('limitations', [
      'isFetching',
      'selectedTreatmentTrain',
      'selectedTreatmentCategory',
      'selectedTreatmentPollutant',
    ]),
    ...sync('customSearch', ['filterPointSourceCategoryCode', 'filterPollutantId', 'filterTreatmentId']),
    limitations() {
      return this.multiCriteriaResults
        ? this.multiCriteriaResults.limitations.map((row) => {
            return {
              ...row,
              limitationValue:
                row.limitationValue !== null ? row.limitationValue : `${row.minimumValue} - ${row.maximumValue}`,
            };
          })
        : [];
    },
  },
  data() {
    return {
      shouldDisplayNotes: false,
      shouldDisplayProcess: false,
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
          filterable: true,
          customFilterSort: ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'],
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
          key: 'limitationDurationTypeDisplay',
          label: 'Type of Limitation',
          filterable: true,
        },
        {
          key: 'goToLta',
          label: 'Go To LTA',
          sortable: false,
        },
      ],
    };
  },
  methods: {
    ...call('customSearch', ['getMultiCriteriaResults']),
    sortBy,
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

.fa-info-circle {
  color: $blue;
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
