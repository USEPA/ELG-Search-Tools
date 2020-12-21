<template>
  <section class="section">
    <div class="columns elg-breadcrumbs-container">
      <div class="column is-8">
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Technology Bases', isCurrent: true },
          ]"
        />
      </div>
      <div class="column">
        <router-link to="/results" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Results
        </router-link>
      </div>
    </div>
    <div class="columns">
      <div class="column is-9">
        <h2 class="is-size-4 has-text-weight-bold page-heading">
          {{ technologyBasisData.treatmentNames }} Technology Bases
        </h2>
        <h3 v-if="!isComparingPscs" class="subtitle is-size-5 has-text-weight-light">
          Point Source Category {{ technologyBasisData.pointSourceCategoryCode }}:
          {{ technologyBasisData.pointSourceCategoryName }}
        </h3>
      </div>
      <div class="column">
        <HelpLinks />
      </div>
    </div>
    <ControlTabs v-if="technologyBasisData" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template v-for="controlTechnology in controlTechData" v-slot:[controlTechnology.controlTechnologyCode]>
        <div :key="controlTechnology.id" class="tab-content tech-basis-tab-content">
          <div>
            <div v-if="controlTechnology.pollutants">
              <span class="has-text-weight-bold">Pollutant(s): </span>
              {{ abbreviatedList(controlTechnology.pollutants) }}
              <a
                class="is-link more"
                v-if="controlTechnology.pollutants.split(', ').length > 2"
                @click="shouldDisplayPollutantsModal(controlTechnology.pollutants)"
              >
                more
              </a>
            </div>
            <div class="field is-grouped download-icon-container">
              <span class="fas fa-download has-text-grey-dark help-icon"></span>
              <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Download Technology Bases (CSV File)</p>
            </div>
            <Table :columns="techBasisCols" :rows="controlTechnology.wastestreamProcessTreatmentTechnologies">
              <template v-slot:cell(goToLimitations)="{ item }">
                <a @click="navigateToLimitations(item)">
                  <span class="fas fa-share-square limitation-link"></span>
                </a>
              </template>
            </Table>
          </div>
        </div>
      </template>
    </ControlTabs>
    <Modal v-if="shouldDisplayPollutants" @close="() => (shouldDisplayPollutants = false)">
      <p><strong>Pollutants:</strong> {{ pollutants }}</p>
    </Modal>
  </section>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Table from '@/components/shared/Table';
import ControlTabs from '@/components/shared/ControlTabs';
import Modal from '@/components/shared/Modal';

export default {
  components: { Breadcrumbs, Table, ControlTabs, Modal },
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
        {
          key: 'goToLimitations',
          label: 'Go To Limitations',
          sortable: false,
        },
      ],
    };
  },
  methods: {
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

.subtitle {
  font-family: inherit;
  margin-bottom: 0.75rem;
}

button {
  background: $blue;
}

.is-link.more {
  margin-left: 3px;
}

label {
  margin-left: 0 !important;
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
