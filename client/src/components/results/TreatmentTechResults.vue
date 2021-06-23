<template>
  <div>
    <div v-if="treatmentTechnologyData">
      <div v-if="selectedTreatmentTechnology" class="info-box-container message">
        <div class="message-body">
          <p><strong>Treatment Technology Description:</strong> {{ treatmentTechnologyData.description }}</p>
        </div>
      </div>
    </div>
    <Alert type="warning">
      <strong>Disclaimer:</strong> The technology basis information in the ELG Database is not comprehensive across all
      Point Source Categories, Levels of Control, and Process Operations/Wastestreams (Process). The results below will
      only display the technology bases for which EPA was able to identify readily available information.
    </Alert>
    <div v-if="treatmentTechnologyData">
      <Alert type="info">
        <strong>Instructions:</strong> The numbers in parentheses next to the Point Source Categories, Pollutants, and
        Treatment Trains dropdown menu titles indicate the total number of records in the ELG Database related to the
        selected treatment technology for that search criteria. From the dropdown menus, select one or more criteria to
        view the search results, including Point Source Category(ies), Pollutant(s), and Treatment Train(s). The table
        below will automatically update after each criterion is selected. Click the “x” next to a criterion to remove it
        from the search results. If EPA was able to readily identify the associated pollutant limitation’s long-term
        average (LTA) an arrow will be displayed in the “Go to LTA” column. Click on this arrow to navigate to the
        long-term average information.
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
          <VueSelect
            inputId="categories"
            v-model="selectedTreatmentCategory"
            :options="sortBy(treatmentTechnologyData.pointSourceCategories, ['pointSourceCategoryCode'])"
            :multiple="true"
            placeholder="Select Category"
            label="pointSourceCategoryName"
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
            <label for="pollutants">
              Pollutants ({{ treatmentTechnologyData.pollutants.length }})
              <HoverText hoverId="pollInfo" :icon="true">
                The above technology is associated with a treatment train to control the discharge of the following
                pollutants.
              </HoverText>
            </label>
          </strong>
          <VueSelect
            inputId="pollutants"
            v-model="selectedTreatmentPollutant"
            :options="treatmentTechnologyData.pollutants"
            :multiple="true"
            placeholder="Select Pollutant"
            label="pollutantDescription"
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
          <VueSelect
            inputId="treatmentTrains"
            v-model="selectedTreatmentTrain"
            :options="treatmentTechnologyData.treatmentTrains"
            :multiple="true"
            placeholder="Select Treatment Train"
            label="names"
          />
        </div>
      </div>
      <p v-if="treatmentTrain" class="pollutant-subtext is-size-5">
        Number of PSCs Referencing Treatment Train: {{ treatmentTrain.length }}
      </p>
      <DownloadLink
        v-if="selectedTreatmentTechnologyCategory"
        title="Limitations"
        :url="
          `/api/treatmentTechnologyCategoryLimitations?id=${selectedTreatmentTechnologyCategory}&treatmentId=${selectedTreatmentTrain
            .map((t) => t.id)
            .join(';')}&pointSourceCategoryCode=${selectedTreatmentCategory
            .map((t) => t.pointSourceCategoryCode)
            .join(';')}&pollutantId=${selectedTreatmentPollutant.map((t) => t.pollutantDescription).join(';')}`
        "
      />
      <DownloadLink
        v-else
        title="Limitations"
        :url="
          `/api/treatmentTechnologyLimitations?id=${
            treatmentTechnologyData.id
          }&treatmentId=${selectedTreatmentTrain
            .map((t) => t.id)
            .join(';')}&pointSourceCategoryCode=${selectedTreatmentCategory
            .map((t) => t.pointSourceCategoryCode)
            .join(';')}&pollutantId=${selectedTreatmentPollutant.map((t) => t.pollutantDescription).join(';')}`
        "
      />
    </div>
    <div>
      <Table
        :columns="limitationColumns"
        :rows="tableProvider"
        :busy="isFetching"
        :perPage="100"
        :count="treatmentLimitationData ? treatmentLimitationData.count : 0"
        :apiUrl="treatmentLimitationsApiUrl"
      >
        <template v-slot:cell(wastestreamProcessTitle)="{ index, item }">
          {{ item.wastestreamProcessTitle }}
          <button
            class="button is-text icon-btn"
            aria-label="Click to view Process description"
            @click="shouldDisplayProcess = index"
          >
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
            aria-label="Click to view Treatment Train Notes"
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
                    (item.wastestreamProcessTreatmentTechnologySourceTitle
                      ? ' (' + item.wastestreamProcessTreatmentTechnologySourceTitle + ')'
                      : '')
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
import { get, sync } from 'vuex-pathify';
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
    ...get('limitations', ['treatmentLimitationData', 'treatmentLimitationsApiUrl']),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedSubcategory']),
    ...sync('limitations', [
      'isFetching',
      'selectedTreatmentTrain',
      'selectedTreatmentCategory',
      'selectedTreatmentPollutant',
    ]),
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
    sortBy,
    onShouldDisplayLongTermAvgData(limitationId) {
      this.$store.dispatch('limitations/getLongTermAvgDataTechSearch', limitationId);
      this.$router.push('/results/limitations/long-term-average');
    },
    async tableProvider(ctx) {
      try {
        const response = await this.$http.get(
          `${ctx.apiUrl}&offset=${ctx.currentPage * ctx.perPage - 100}&sortCol=${ctx.sortBy}&sortDir=${
            ctx.sortDesc ? 'desc' : 'asc'
          }`
        );
        this.$store.commit('limitations/SET_TREATMENT_LIMITATION_DATA', response.data);
        return response.data.limitations.map((row) => {
          let limitationValueDisplay = row.limitationValue;

          if (limitationValueDisplay === null) {
            limitationValueDisplay =
              row.minimumValue !== null && row.maximumValue !== null
                ? `${row.minimumValue} - ${row.maximumValue}`
                : row.minimumValue;
          }

          if (limitationValueDisplay === null) {
            limitationValueDisplay = '--';
          }

          return {
            ...row,
            limitationValue: limitationValueDisplay,
          };
        });
      } catch (error) {
        return [];
      }
    },
  },
  mounted() {
    // this.$store.dispatch('limitations/getTreatmentTechnologyLimitations');
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
