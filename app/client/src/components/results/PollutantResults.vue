<template>
  <div>
    <div class="grid-row grid-gap-2">
      <div class="grid-col">
        <Alert type="info" class="display-inline-block">
          <p>
            Number of PSCs Referencing Pollutant{{ selectedPollutantCategory ? ' Category' : '' }}:
            {{ new Set(pollutantData.pscs.map((row) => row.pointSourceCategoryCode)).size }}
          </p>
        </Alert>
      </div>
      <div class="grid-col">
        <Alert v-if="!selectedPollutantCategory && pollutantData.ranges.length > 0" type="info">
          Range of Pollutant Limitations (Concentration):
          <HoverText hoverId="rangeInstructions" :icon="true">
            The pollutant limitation ranges across point source categories includes concentration-based limitations for
            the limitation types listed and not a complete range of all ELG limitations for the pollutant. For example,
            the range excludes quantity-based limitations and excludes ELGs where limitations differ for continuous and
            noncontinuous discharges (i.e., a subset of limitations at 40 CFR 430 and 40 CFR 464).
          </HoverText>
          <br />
          <ul style="padding-bottom: 0">
            <li v-for="range in pollutantData.ranges" :key="range" style="list-style-type: disc">
              {{ range }}
            </li>
          </ul>
        </Alert>
      </div>
    </div>
    <div class="grid-row grid-gap-2 no-margin">
      <div v-if="!selectedPollutantCategory" class="grid-col">
        <button
          :disabled="selectedPscs.length === 0"
          :title="selectedPscs.length ? '' : 'You must select at least one PSC to compare'"
          class="usa-button is-hyperlink cfr-link"
          @click="navigateToLimitationsForMultiplePscs(pollutantData.pscs[0])"
        >
          <span class="fas fa-share-square" />Compare Limitations for Selected PSCs
        </button>
        <HoverText hoverId="catInfo" :icon="true" style="margin-left: 0.25rem">
          Select PSCs of interest in the first column below.
        </HoverText>
      </div>
      <div class="grid-col">
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

    <Table :columns="selectedPollutantCategory ? pollCategoryColumns : pollColumns" :rows="pollutantData.pscs">
      <template v-for="fieldKey in Object.keys(headerDescriptions)" v-slot:[`head(${fieldKey})`]="data">
        {{ data.field.label }}
        <button
          :key="fieldKey"
          class="usa-button is-text icon-btn"
          @click="openModal(data.field.label, headerDescriptions[fieldKey])"
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:cell(selectPsc)="{ item }">
        <div class="usa-checkbox">
          <input
            :id="`pollutant${item.pollutantId}-${item.pointSourceCategoryCode}`"
            class="usa-checkbox__input table-checkbox"
            type="checkbox"
            :value="{ pollutantId: item.pollutantId, pointSourceCategoryCode: item.pointSourceCategoryCode }"
            v-model="selectedPscs"
          />
          <label :for="`pollutant${item.pollutantId}-${item.pointSourceCategoryCode}`" class="usa-checkbox__label">
            <span class="sr-only"> Select Point Source Category and click "Compare PSCs" to view limitations. </span>
          </label>
        </div>
      </template>
      <template v-slot:cell(pointSourceCategoryName)="{ item }">
        <a :href="item.pointSourceCategoryLinkUrl" target="_blank" rel="noopener noreferrer">
          {{ item.pointSourceCategoryName }} <span class="fa fa-external-link-alt" />
        </a>
      </template>
      <template v-slot:cell(pointSourceSubcategories)="{ value }">
        <span v-if="value !== ''" v-html="value" />
        <span v-else>--</span>
      </template>
      <template v-slot:head(rangeOfPollutantLimitations)="{ field }">
        <table class="range-sub-table">
          <thead>
            <tr>
              <th colspan="12">{{ field.label }}</th>
            </tr>
            <tr>
              <th colspan="2" style="display: inline-block; float: none; width: 18%">Min</th>
              <th colspan="2" style="display: inline-block; float: none; width: 18%">Max</th>
              <th colspan="4" style="display: inline-block; float: none; width: 32%">Units</th>
              <th colspan="4" style="display: inline-block; float: none; width: 32%">Type of Limitation</th>
            </tr>
          </thead>
        </table>
        <!-- <BRow>
          <BCol cols="12">{{ label }}</BCol>
        </BRow>
        <BRow>
          <BCol cols="2" style="display:inline-block; float: none; width: 17%">Min</BCol>
          <BCol cols="2" style="display:inline-block; float: none; width: 17%">Max</BCol>
          <BCol cols="4" style="display:inline-block; float: none; width: 33%">Units</BCol>
          <BCol cols="4" style="display:inline-block; float: none; width: 33%">Type of Limitation</BCol>
        </BRow> -->
      </template>
      <template v-slot:cell(rangeOfPollutantLimitations)="{ value, item }">
        <span v-if="value !== []">
          <table class="usa-table" style="font-size: 0.87rem">
            <thead class="sr-only">
              <th>Min</th>
              <th>Max</th>
              <th>Units</th>
              <th>Type of Limitation</th>
            </thead>
            <tbody>
              <tr v-for="(range, index) in value" :key="index">
                <td style="width: 18%">
                  <HoverText
                    v-if="
                      range.alternateLimitFlag && range.alternateLimitFlag !== '<' && range.alternateLimitFlag !== '>='
                    "
                    :id="`flagMinHover${item.pollutantId}-${item.pointSourceCategoryCode}${index}`"
                    :linkText="
                      range.alternateLimitFlag === 'ADJUST' || range.alternateLimitFlag === 'X by Factor'
                        ? range.alternateLimitFlag
                        : range.minimumLimitationValue
                    "
                  >
                    <div v-if="range.alternateLimitFlag === 'ADJUST' || range.alternateLimitFlag === 'X by Factor'">
                      Limitation Value: {{ range.minimumLimitationValue }} {{ range.limitationUnitCode }}
                    </div>
                    Limitation Flag: {{ range.alternateLimitFlag }} - {{ range.alternateLimitDescription }}
                  </HoverText>
                  <span v-else>
                    {{ range.minimumLimitationValue }}
                  </span>
                </td>
                <td style="width: 18%">
                  <HoverText
                    v-if="
                      range.alternateLimitFlag && range.alternateLimitFlag !== '<' && range.alternateLimitFlag !== '>='
                    "
                    :id="`flagMaxHover${item.pollutantId}-${item.pointSourceCategoryCode}${index}`"
                    :linkText="
                      range.alternateLimitFlag === 'ADJUST' || range.alternateLimitFlag === 'X by Factor'
                        ? range.alternateLimitFlag
                        : range.maximumLimitationValue
                    "
                  >
                    <div v-if="range.alternateLimitFlag === 'ADJUST' || range.alternateLimitFlag === 'X by Factor'">
                      Limitation Value: {{ range.maximumLimitationValue }} {{ range.limitationUnitCode }}
                    </div>
                    Limitation Flag: {{ range.alternateLimitFlag }} - {{ range.alternateLimitDescription }}
                  </HoverText>
                  <span v-else>
                    {{ range.maximumLimitationValue }}
                  </span>
                </td>
                <td style="width: 32%">
                  {{ range.limitationUnitCode }}
                </td>
                <td style="width: 32%">
                  <HoverText
                    :hoverId="`unitsHover${item.pollutantId}-${item.pointSourceCategoryCode}-${index}`"
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
    <Modal v-if="shouldDisplayModal" :title="currentModalTitle" @close="shouldDisplayModal = false">
      <p class="has-text-left">
        <span v-html="currentModalContent" />
      </p>
    </Modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import HoverText from '@/components/shared/HoverText.vue';
import DownloadLink from '@/components/shared/DownloadLink.vue';
import Table from '@/components/shared/Table.vue';
import { mapStatesToComputed } from '../../store';

export default {
  components: { HoverText, DownloadLink, Table },
  computed: {
    ...mapState('search', ['pollutantData', 'selectedPollutant', 'selectedPollutantCategory']),
    ...mapStatesToComputed('search', ['selectedPscs']),
  },
  data() {
    return {
      shouldDisplayModal: false,
      pollColumns: [
        {
          key: 'selectPsc',
          label: 'Select PSC',
          sortable: false,
          tdClass: 'align-top',
        },
        {
          key: 'pointSourceCategoryCode',
          label: '40 CFR',
          tdClass: 'align-top',
        },
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
          tdClass: 'text-left align-top',
        },
        {
          key: 'pointSourceSubcategories',
          label: 'Subcategories',
          isAbbreviatedList: true,
          tdClass: 'text-left align-top',
        },
        {
          key: 'rangeOfPollutantLimitations',
          label: 'Range of Pollutant Limitations',
          displayAsHTML: true,
          sortable: false,
          tdClass: 'align-top range-poll-cell',
          thClass: 'range-poll-header',
        },
        {
          key: 'goToLimitations',
          label: 'Go to Limitations',
          sortable: false,
          tdClass: 'align-top',
        },
      ],
      pollCategoryColumns: [
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
          tdClass: 'align-top',
        },
        {
          key: 'pointSourceCategoryCode',
          label: '40 CFR',
          tdClass: 'align-top',
        },
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
          tdClass: 'text-left align-top',
        },
        {
          key: 'pointSourceSubcategories',
          label: 'Subcategories',
          isAbbreviatedList: true,
          tdClass: 'text-left align-top',
        },
        {
          key: 'rangeOfPollutantLimitations',
          label: 'Range of Pollutant Limitations',
          displayAsHTML: true,
          sortable: false,
          tdClass: 'align-top range-poll-cell',
          thClass: 'range-poll-header',
        },
        {
          key: 'goToLimitations',
          label: 'Go to Limitations',
          sortable: false,
          tdClass: 'align-top',
        },
      ],
      headerDescriptions: {
        pointSourceCategoryName:
          'Click on the PSC title to access the ELG Category Overview (Support Documents & History).',
      },
    };
  },
  methods: {
    openModal(title, content) {
      this.currentModalTitle = title;
      this.currentModalContent = content;
      this.shouldDisplayModal = true;
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

:deep() {
  th[aria-colindex='5'] {
    padding: 0 !important;
  }

  .range-sub-table {
    width: 100%;
    margin: 0;
    font-size: 0.87rem;

    th {
      border-bottom: 0 !important;
    }
  }

  .range-poll-cell {
    padding: 0;

    td {
      padding: 0.25rem;
    }
  }

  .range-poll-cell tr:nth-child(even) td {
    background-color: #ffffff;
  }
  .range-poll-cell tr:nth-child(odd) td {
    background-color: #f0f0f0;
  }
}

.table-checkbox {
  & + label {
    &::before {
      left: calc(50% - 0.75rem);
    }
  }
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
  margin-bottom: 0 !important;
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

input[type='checkbox'] {
  display: none;
}
</style>
