<template>
  <div>
    <div class="columns">
      <div class="column">
        <Alert type="info">
          <p>
            Number of PSCs Referencing Pollutant{{ selectedPollutantCategory ? ' Category' : '' }}:
            {{ new Set(pollutantData.pscs.map((row) => row.pointSourceCategoryCode)).size }}
          </p>
        </Alert>
      </div>
      <div class="column">
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
    <div class="columns no-margin">
      <div v-if="!selectedPollutantCategory" class="column">
        <button
          :disabled="selectedPscs.length === 0"
          :title="selectedPscs.length ? '' : 'You must select at least one PSC to compare'"
          class="button is-hyperlink cfr-link"
          @click="navigateToLimitationsForMultiplePscs(pollutantData.pscs[0])"
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

    <Table :columns="selectedPollutantCategory ? pollCategoryColumns : pollColumns" :rows="pollutantData.pscs">
      <template v-for="fieldKey in Object.keys(headerDescriptions)" v-slot:[`head(${fieldKey})`]="data">
        {{ data.label }}
        <button
          :key="fieldKey"
          class="button is-text icon-btn"
          @click="openModal(data.label, headerDescriptions[fieldKey])"
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:cell(selectPsc)="{ item }">
        <input
          :id="`pollutant${item.pollutantId}-${item.pointSourceCategoryCode}`"
          class="table-checkbox"
          type="checkbox"
          :value="{ pollutantId: item.pollutantId, pointSourceCategoryCode: item.pointSourceCategoryCode }"
          v-model="selectedPscs"
        />
        <label :for="`pollutant${item.pollutantId}-${item.pointSourceCategoryCode}`">
          <span class="sr-only">
            Select Point Source Category and click "Compare PSCs" to view limitations.
          </span>
        </label>
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
      <template v-slot:cell(rangeOfPollutantLimitations)="{ value, item }">
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
                <td style="width: 17%">
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
                <td style="width: 17%">
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
                <td style="width: 33%">
                  {{ range.limitationUnitCode }}
                </td>
                <td style="width: 33%">
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
import { BRow, BCol } from 'bootstrap-vue';
import HoverText from '@/components/shared/HoverText.vue';
import DownloadLink from '@/components/shared/DownloadLink.vue';
import Table from '@/components/shared/Table.vue';
import { mapStatesToComputed } from '../../store';

export default {
  components: { HoverText, DownloadLink, Table, BRow, BCol },
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
          tdClass: 'align-top',
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
          tdClass: 'align-top',
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

input[type='checkbox'] {
  display: none;
}
</style>
