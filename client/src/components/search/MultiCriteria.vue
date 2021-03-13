<template>
  <div v-if="!multiCriteriaLookups || Object.keys(multiCriteriaLookups).length === 0">
    <LoadingIndicator />
  </div>
  <div v-else>
    <Alert type="info" :isSlim="true">
      Select one or more criteria (Point Source Category(ies), Pollutant(s), and Treatment Technology(ies) dropdown
      menus) to include in the search results. You can also search by entering an industry code (SIC or NAICS),
      Pollutant Category, or Treatment Technology Category. Click the “x” next to a criterion to remove it from the
      search results. Multi-Criteria Search results present the pollutant limitations associated with the criteria.
    </Alert>
    <form class="columns" @submit="getResults">
      <div class="column is-4">
        <label for="pointSourceCategory">Point Source Categories</label>

        <VueSelect
          inputId="pointSourceCategory"
          v-model="pointSourceCategoryCode"
          multiple
          :options="multiCriteriaLookups.pointSourceCategories"
          placeholder="Select Category"
          label="pointSourceCategoryName"
          :reduce="(o) => o.pointSourceCategoryCode"
        >
          <template #option="option">
            {{ option.pointSourceCategoryCode }}: {{ option.pointSourceCategoryName }}
          </template>
          <template #selected-option="option">
            {{ option.pointSourceCategoryCode }}: {{ option.pointSourceCategoryName }}
          </template>
        </VueSelect>
        <div class="message message-box">
          <p>OR</p>
          <label>
            Search by Industry Code
            <HoverText hoverId="keywordIndustryInfo" :icon="true">
              The SIC and NAICS codes are generally associated with the industry but the applicability statement(s) in
              the CFR are the legal basis for regulated facilities.
            </HoverText>
          </label>
          <label for="sicCode" class="sr-only">SIC Code</label>
          <VueSelect
            inputId="sicCode"
            v-model="sicCode"
            placeholder="Type or select SIC Code"
            :multiple="true"
            :options="multiCriteriaLookups.sicCodes"
            label="sicDescription"
            :reduce="(o) => o.sicCode"
          >
            <template #option="option"> {{ option.sicCodeDisplay }}: {{ option.sicDescription }} </template>
            <template #selected-option="option"> {{ option.sicCodeDisplay }}: {{ option.sicDescription }} </template>
          </VueSelect>

          <label for="naicsCode" class="sr-only"></label>
          <VueSelect
            inputId="naicsCode"
            v-model="naicsCode"
            placeholder="Type or select NAICS Code"
            :multiple="true"
            :options="multiCriteriaLookups.naicsCodes"
            label="naicsDescription"
            :reduce="(o) => o.naicsCode"
          >
            <template #option="option"> {{ option.naicsCodeDisplay }}: {{ option.naicsDescription }} </template>
            <template #selected-option="option">
              {{ option.naicsCodeDisplay }}: {{ option.naicsDescription }}
            </template>
          </VueSelect>
        </div>
      </div>
      <div class="column is-4">
        <label for="pollutant">
          Pollutants
          <button
            type="button"
            class="button is-text icon-btn"
            title="Click to view Pollutant Category descriptions"
            @click="shouldDisplayPollCatDescriptions = true"
          >
            <span class="fa fa-info-circle"></span>
          </button>
        </label>
        <VueSelect
          id="pollutant"
          v-model="pollutantId"
          :multiple="true"
          :options="multiCriteriaLookups.pollutants"
          placeholder="Select Pollutant"
          label="pollutantDescription"
          :reduce="(o) => o.pollutantId"
        />
        <label class="sr-only" for="pollutantCategory">Pollutant Categories</label>
        <VueSelect
          id="pollutantCategory"
          v-model="pollutantGroupId"
          :multiple="true"
          :options="multiCriteriaLookups.pollutantGroups"
          placeholder="Select Pollutant Category"
          label="description"
          :reduce="(o) => o.id"
        />
        <div class="message message-box limitation-range">
          <p>
            Only include Pollutants with limitation range (concentration basis only):
            <HoverText hoverId="unitsInfo" :icon="true">
              Units of measurement as presented in CFR. The units applicable to a pollutant limitation may differ
              between Point Source Categories.
            </HoverText>
          </p>
          <div class="limitation-inputs">
            <input
              v-model="rangeLow"
              type="number"
              min="0"
              step="any"
              :disabled="!pollutantGroupId.length && !pollutantId.length"
              :title="
                !pollutantGroupId.length && !pollutantId.length
                  ? 'You must select a pollutant or pollutant category to enter a range.'
                  : ''
              "
            />
            to
            <input
              v-model="rangeHigh"
              type="number"
              min="0"
              step="any"
              :disabled="!pollutantGroupId.length && !pollutantId.length"
              :title="
                !pollutantGroupId.length && !pollutantId.length
                  ? 'You must select a pollutant or pollutant category to enter a range.'
                  : ''
              "
            />
            <VueSelect
              id="limitationUnits"
              v-model="rangeUnitCode"
              :options="multiCriteriaLookups.limitationUnits"
              label="code"
              :reduce="(o) => o.code"
              placeholder="Select Units"
              :disabled="!pollutantGroupId.length && !pollutantId.length"
            />
          </div>
          <Modal
            v-if="shouldDisplayPollCatDescriptions"
            title="Pollutant Category Descriptions"
            @close="shouldDisplayPollCatDescriptions = false"
          >
            <div class="content">
              <ul>
                <li v-for="cat in multiCriteriaLookups.pollutantGroups" :key="cat.id">
                  <strong>{{ cat.description }}</strong
                  >: {{ pollCatDescriptions[cat.id] }}
                </li>
              </ul>
            </div>
          </Modal>
        </div>
      </div>
      <div class="column is-4">
        <label for="treatmentTech">Treatment Technology</label>
        <VueSelect
          id="treatmentTech"
          v-model="treatmentTechnologyCode"
          :multiple="true"
          :options="multiCriteriaLookups.treatmentTechnologyCodes"
          placeholder="Select Treatment Technology"
          label="name"
          :reduce="(o) => o.id"
        />
        <label class="sr-only" for="treatmentTechCategory">Treatment Technology Category</label>
        <VueSelect
          id="treatmentTechCategory"
          v-model="treatmentTechnologyGroup"
          :multiple="true"
          :options="multiCriteriaLookups.treatmentTechnologyGroups"
          placeholder="Select Treatment Technology Category"
          label="category"
          :reduce="(o) => o.category"
        />
        <div class="has-text-right">
          <button type="submit" class="button is-dark is-medium">
            <span :class="`fa has-text-white ${isFetching ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
            Search
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import VueSelect from 'vue-select';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default {
  components: { VueSelect, LoadingIndicator },
  data() {
    return {
      isFetching: false,
      shouldDisplayPollCatDescriptions: false,
      pollCatDescriptions: {
        '1': 'All 126 pollutants that EPA currently defines as priority pollutants.',
        '2':
          'Parameters include total nitrogen, organic nitrogen, total Kjeldahl nitrogen, nitrite, nitrate, and ammonia.',
        '3': 'Parameters include phosphorus and phosphate.',
        '4': 'Biochemical oxygen demand (BOD5), total suspended solids (TSS), fecal coliform, pH, and oil & grease.',
        '5': 'Suspended and settable solids.',
        '6':
          'All metals parameters, including hexavalent or trivalent metals and metals in ionic form (e.g., hexavalent chromium and aluminum, ion) and metals on the CWA priority pollutant list. Excludes metal compounds (e.g., calcium chloride).',
      },
    };
  },
  computed: {
    ...get('customSearch', ['multiCriteriaLookups']),
    ...sync('customSearch', [
      'pointSourceCategoryCode',
      'sicCode',
      'naicsCode',
      'pollutantId',
      'pollutantGroupId',
      'rangeLow',
      'rangeHigh',
      'rangeUnitCode',
      'treatmentTechnologyCode',
      'treatmentTechnologyGroup',
    ]),
  },
  methods: {
    getResults() {
      this.$router.push('/results');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.message-box {
  padding: 0.5rem;

  p {
    padding-bottom: 0.75rem;
  }
}

.limitation-range {
  input[type='number'] {
    width: 5rem;
    margin: 0 0.5rem 0.25rem 0.5rem;
    padding: 4px;
    border: 1px solid #b1b1b1;

    &:first-child {
      margin-left: 0;
    }
  }

  input:disabled {
    background: none;
    background-color: #fbfbfb;
    cursor: not-allowed;
  }
}

.content ul {
  margin-top: 0;
  padding-left: 0;
}

::v-deep .multiselect {
  margin-bottom: 0.5rem;

  &.multiselect--disabled {
    .multiselect__tags,
    .multiselect__select,
    .multiselect__single {
      background-color: #fbfbfb;
      cursor: not-allowed;
    }
  }
}
</style>
