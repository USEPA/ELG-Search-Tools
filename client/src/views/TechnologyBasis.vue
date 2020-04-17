<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <h1 class="is-size-3 has-text-weight-light">
          {{ technologyBasisData.treatmentNames }}
        </h1>
        <h1 v-if="!isComparingPscs" class="is-size-5 has-text-weight-light">
          {{ technologyBasisData.pointSourceCategoryCode }}: {{ technologyBasisData.pointSourceCategoryName }}
        </h1>
      </div>
      <div class="column">
        <router-link to="/results" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </router-link>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Technology Bases', isCurrent: true },
          ]"
        />
      </div>
      <div class="column field is-grouped help-icons">
        <div class="field is-grouped">
          <span class="fas fa-book has-text-grey-dark help-icon"></span>
          <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
        </div>
        <div class="field is-grouped help-container">
          <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
          <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
        </div>
      </div>
    </div>
    <Tabs v-if="technologyBasisData" :tabs="controlTechTabs" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template v-for="controlTechnology in controlTechData" v-slot:[controlTechnology.controlTechnologyCode]>
        <div :key="controlTechnology.id" class="columns tab-content tech-basis-tab-content">
          <div class="column tech-basis-container">
            <div class="field is-grouped" v-if="controlTechnology.pollutants">
              <b>Pollutant(s): </b> {{ abbreviatedList(controlTechnology.pollutants) }}
              <a
                class="is-link more"
                v-if="controlTechnology.pollutants.split(', ').length > 2"
                @click="shouldDisplayPollutantsModal(controlTechnology.pollutants)"
                >more</a
              >
            </div>
            <div class="field is-grouped download-icon-container">
              <span class="fas fa-download has-text-grey-dark help-icon"></span>
              <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Download Technology Bases (CSV File)</p>
            </div>
            <div class="field">
              <Table
                :columns="techBasisCols"
                :rows="controlTechnology.wastestreamProcessTreatmentTechnologies"
                :shouldHaveTechBasisCols="true"
                @onNavigateToLimitations="navigateToLimitations"
                :isComparingPscs="isComparingPscs"
                :colsLength="9"
              />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
    <Modal v-if="shouldDisplayPollutants" @close="() => (shouldDisplayPollutants = false)">
      <p><strong>Pollutants:</strong> {{ pollutants }}</p>
    </Modal>
  </section>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Table from '@/components/shared/Table';
import Tabs from '@/components/shared/Tabs';
import Modal from '@/components/shared/Modal';

export default {
  components: { Breadcrumbs, Table, Tabs, Modal },
  computed: {
    ...get('search', ['technologyBasisData', 'isComparingPscs']),
    ...sync('results', ['activeTab']),
    controlTechData() {
      return this.controlTechTabs.map((controlTechCode) =>
        this.technologyBasisData.controlTechnologies.find((tech) => tech.controlTechnologyCode === controlTechCode)
      );
    },
  },
  data() {
    return {
      controlTechTabs: ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'],
      shouldDisplayPollutants: false,
      techBasisCols: [
        {
          key: 'pointSourceCategoryCode',
          label: '40 CFR',
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
          label: 'Process Operation/Wastestream',
        },
        {
          key: 'wastestreamProcessSecondary',
          label: 'Other Process/Wastestream Detail(s)',
          displayAsHTML: true,
        },
        {
          key: 'treatmentNames',
          label: 'Treatment Train',
        },
        {
          key: 'wastestreamProcessTreatmentTechnologyNotes',
          label: 'Treatment Notes',
        },
        {
          key: 'wastestreamProcessTreatmentTechnologySourceTitle',
          label: 'Treatment Reference',
        },
        {
          key: 'wastestreamProcessTreatmentTechnologyBmpType',
          label: 'Type of BMP',
        },
        {
          key: 'wastestreamProcessTreatmentTechnologyZeroDischarge',
          label: 'Zero Discharge',
        },
      ],
    };
  },
  methods: {
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    abbreviatedList(value) {
      const shortList = value.split(', ');

      if (shortList.length >= 2) {
        return `${shortList[0]}, ${shortList[1]}`;
      }

      if (shortList.length === 1) {
        return value;
      }

      return '';
    },
    shouldDisplayPollutantsModal(list) {
      this.pollutants = null;
      if (list) {
        this.shouldDisplayPollutants = true;
        this.pollutants = list;
      }
    },
    async navigateToLimitations(row) {
      if (row.treatmentId && row.pointSourceCategoryCode) {
        await this.$store.dispatch('limitations/getTechnologyBasisLimitationData', {
          treatmentId: row.treatmentId,
          pointSourceCategoryCode: row.pointSourceCategoryCode,
        });
        await this.$store.dispatch('limitations/getPollutantInfo', {
          pointSourceCategoryCode: row.pointSourceCategoryCode,
          pointSourceCategoryName: row.pointSourceCategoryName,
          treatmentNames: row.treatmentNames,
        });
      }
      await this.$router.push('/results/limitations');
    },
    changeControlTechTab(tab) {
      this.activeTab = tab;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';

button {
  background: $blue;
}

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
}

.help-icon {
  font-size: 20px;
  margin-right: 5px;
}

.help-icons {
  justify-content: flex-end;
  margin-bottom: 0;
}

.help-container {
  margin-left: 20px;
}

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}

.download-icon-container {
  justify-content: flex-end;
  margin-bottom: 0;
}

.tech-basis-container {
  padding: 0 0.75em;
}

.tech-basis-tab-content {
  margin-top: 0 !important;
}
</style>
