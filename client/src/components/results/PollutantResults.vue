<template>
  <div>
    <p class="pollutant-subtext">
      Number of PSCs Referencing Pollutant{{ selectedPollutantCategory ? ' Category' : '' }}:
      {{ new Set(pollutantData.map((row) => row.pointSourceCategoryCode)).size }}
    </p>
    <div class="columns no-margin">
      <div v-if="!selectedPollutantCategory" class="column">
        <button
          :disabled="selectedPscs.length === 0"
          :title="selectedPscs.length ? '' : 'You must select at least one PSC to compare'"
          class="button is-hyperlink cfr-link"
          @click="navigateToLimitationsForMultiplePscs(pollutantData[0])"
        >
          <span class="fas fa-share-square" />Compare Limitations for Selected PSCs
        </button>
        <HoverText hoverId="catInfo" :icon="true" style="margin-left:0.25rem">
          Select PSCs of interest in the first column below.
        </HoverText>
      </div>
      <div class="column">
        <DownloadLink
          v-if="selectedPollutant"
          title="Limitations"
          :url="`/api/pollutant/?id=${encodeURIComponent(selectedPollutant.pollutantId)}`"
        />
        <DownloadLink
          v-else-if="selectedPollutantCategory"
          title="Limitations"
          :url="`/api/pollutantCategory/?id=${selectedPollutantCategory.id}`"
        />
      </div>
    </div>

    <Table :columns="selectedPollutantCategory ? pollCategoryColumns : pollColumns" :rows="pollutantData">
      <template v-slot:cell(selectPsc)="{ item }">
        <label class="sr-only">Select Point Source Category and click "Compare PSCs" to view limitations.</label>
        <input
          class="table-checkbox"
          type="checkbox"
          :value="{ pollutantId: item.pollutantId, pointSourceCategoryCode: item.pointSourceCategoryCode }"
          v-model="selectedPscs"
        />
      </template>
      <template v-slot:cell(pointSourceSubcategories)="{ value }">
        <span v-if="value !== ''" v-html="value" />
        <span v-else>--</span>
      </template>
      <template v-slot:head(rangeOfPollutantLimitations)="{ label }">
        <BRow>
          <BCol cols="12">{{ label }}</BCol>
        </BRow>
        <BRow>
          <BCol cols="2" style="display:inline-block; float: none; width: 17%">Min</BCol>
          <BCol cols="2" style="display:inline-block; float: none; width: 17%">Max</BCol>
          <BCol cols="4" style="display:inline-block; float: none; width: 33%">Units</BCol>
          <BCol cols="4" style="display:inline-block; float: none; width: 33%">Type of Limitation</BCol>
        </BRow>
      </template>
      <template v-slot:cell(rangeOfPollutantLimitations)="{ value }">
        <span v-if="value !== []">
          <table>
            <thead class="sr-only">
              <th>Min</th>
              <th>Max</th>
              <th>Units</th>
              <th>Type of Limitation</th>
            </thead>
            <tbody>
              <tr v-for="(range, index) in value" :key="index">
                <td width="17%">
                  {{ range.minimumLimitationValue }}
                </td>
                <td width="17%">
                  {{ range.maximumLimitationValue }}
                </td>
                <td width="33%">
                  {{ range.limitationUnitCode }}
                </td>
                <td width="33%">
                  <HoverText
                    :hoverId="`units${range.limitationUnitCode + range.limitationType}`"
                    :linkText="range.limitationType"
                    :customStyle="{ width: '125px' }"
                  >
                    {{ range.limitationDurationDescription }}
                  </HoverText>
                </td>
              </tr>
            </tbody>
          </table>
        </span>
        <span v-else>--</span>
      </template>
      <template v-slot:cell(goToLimitations)="{ item }">
        <a @click="navigateToLimitations(item)">
          <span class="fas fa-share-square limitation-link"></span>
        </a>
      </template>
    </Table>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import HoverText from '@/components/shared/HoverText';
import DownloadLink from '@/components/shared/DownloadLink';
import Table from '@/components/shared/Table';
import { BRow, BCol } from 'bootstrap-vue';

export default {
  components: { HoverText, DownloadLink, Table, BRow, BCol },
  computed: {
    ...get('search', ['pollutantData', 'selectedPollutant', 'selectedPollutantCategory']),
    ...sync('search', ['selectedPscs']),
  },
  data() {
    return {
      pollColumns: [
        {
          key: 'selectPsc',
          label: 'Select PSC',
          sortable: false,
        },
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
          sortable: false,
        },
        {
          key: 'goToLimitations',
          label: 'Go to Limitations',
          sortable: false,
        },
      ],
      pollCategoryColumns: [
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
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
          sortable: false,
        },
        {
          key: 'goToLimitations',
          label: 'Go to Limitations',
          sortable: false,
        },
      ],
    };
  },
  methods: {
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
          pollutantId: row.pollutantId,
          pollutantDescription: row.pollutantDescription,
        });
      }
      this.$router.push('/results/limitations');
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
      this.$router.push('/results/limitations');
    },
  },
  mounted() {
    // Clear any previously selected PSCs when page mounts
    this.selectedPscs = [];
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.table-checkbox {
  height: 16px;
  width: 16px;
}

.cfr-link {
  text-decoration: none;
  margin: 0;

  &:hover {
    text-decoration: underline;
  }
}

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
