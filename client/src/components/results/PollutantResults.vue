<template>
  <div>
    <p class="pollutant-subtext">Number of PSCs Referencing Pollutant: {{ pollutantData.length }}</p>
    <div class="field is-grouped">
      <a @click="navigateToLimitationsForMultiplePscs(pollutantData[0])">
        <span class="fas fa-share-square" />Go to PSC Comparison
      </a>
    </div>
    <Table
      :columns="pollColumns"
      :rows="pollutantData"
      :should-have-poll-cols="true"
      :can-compare-pscs="true"
      :cols-length="6"
      @onNavigateToLimitations="navigateToLimitations"
      @shouldDisplayMoreModal="displayMoreModal"
      @onSelectedPsc="selectedPsc"
    />

    <Modal v-if="shouldDisplayMoreModal" @close="() => (shouldDisplayMoreModal = false)">
      <span v-html="currentMoreInfo" />
    </Modal>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { Table, Modal },
  computed: {
    ...get('search', ['pollutantData']),
  },
  data() {
    return {
      currentMoreInfo: null,
      shouldDisplayMoreModal: false,
      selectedPscs: [],
      pollColumns: [
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
          pollutantDescription: row.pollutantDescription,
        });
      }
      this.$router.push('/results/limitations');
    },
    selectedPsc(row, e) {
      if (e.target.checked) {
        // add this psc/pollutant combination to the selected list
        this.selectedPscs.push({ pollutantId: row.pollutantId, pointSourceCategoryCode: row.pointSourceCategoryCode });
      } else {
        // remove this psc/pollutant combination from the selected list
        this.selectedPscs = this.selectedPscs.filter(
          (psc) => !(psc.pollutantId === row.pollutantId && psc.pointSourceCategoryCode === row.pointSourceCategoryCode)
        );
      }
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
    displayMoreModal(value) {
      this.currentMoreInfo = null;
      this.currentMoreInfo = value;
      this.shouldDisplayMoreModal = true;
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
