<template>
  <div>
    <div class="columns">
      <div class="column is-10">
        <div class="cfr-link">
          <router-link :to="{ path: '/results/about-cfr', query: { psc: selectedCategory.pointSourceCategoryCode } }">
            About 40 CFR {{ selectedCategory.pointSourceCategoryCode }}: Applicability, General Requirements, and
            Definitions
            <span class="fa fa-external-link-alt" />
          </router-link>
        </div>
      </div>
      <div class="column is-2">
        <div class="cfr-link is-pulled-right">
          <a
            title="Electronic Code of Federal Regulations"
            :href="`https://www.ecfr.gov/cgi-bin/text-idx?node=pt40.31.${selectedCategory.pointSourceCategoryCode}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            eCFR <span class="fa fa-external-link-alt" />
          </a>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="info-box-container message">
          <div class="message-body">
            <p><strong>Pollutant(s):</strong> {{ categoryData.pollutants }}</p>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="info-box-container message">
          <div class="message-body">
            <p><strong>Treatment Technology(ies):</strong> {{ categoryData.technologyNames }}</p>
          </div>
        </div>
      </div>
    </div>
    <Alert type="info" class="instructions-alert">
      Select a Subcategory for details on the Level of Control (BPT, BAT, BCT, NSPS, PSES, PSNS) and process
      operations/wastestream requirements.
    </Alert>
    <div class="psc-select">
      <label class="sr-only" for="subcategory">Subpart</label>
      <Multiselect
        :value="selectedSubcategory"
        :options="categoryData.pointSourceSubcategories"
        placeholder="Select Subcategory"
        label="comboSubcategory"
        :custom-label="(option) => 'Subpart ' + option.comboSubcategory"
        @input="onChangeSubcategory"
        class="results-select"
      />
    </div>

    <ControlTabs v-if="subcategoryData" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template
        v-for="controlTechnology in subcategoryData.controlTechnologies"
        v-slot:[controlTechnology.controlTechnologyCode]
      >
        <div :key="controlTechnology.id" class="tab-content">
          <div class="field is-grouped">
            <div class="control is-expanded">
              <h3 class="is-size-6  has-text-weight-semibold">
                {{ controlTechnology.controlTechnologyDescription }} ({{ controlTechnology.controlTechnologyCode }}) at
                a Glance
              </h3>
            </div>
            <div class="control">
              <a
                class="is-link"
                v-if="controlTechnology.notes && controlTechnology.notes.length > 0"
                @click="shouldDisplayNotesModal(controlTechnology.notes)"
                >Level of Control Notes</a
              >
            </div>
          </div>
          <div class="columns">
            <div class="column" v-if="controlTechnology.pollutants.length">
              <div class="info-box-container message">
                <div class="message-body">
                  <p><strong>Pollutant(s):</strong> {{ controlTechnology.pollutants }}</p>
                </div>
              </div>
            </div>
            <div class="column" v-if="controlTechnology.technologyNames.length">
              <div class="info-box-container message">
                <div class="message-body">
                  <p><strong>Treatment Technology(ies):</strong> {{ controlTechnology.technologyNames }}</p>
                </div>
              </div>
            </div>
          </div>
          <NewTable
            v-if="controlTechnology.wastestreamProcesses"
            :columns="pscColumns"
            :rows="controlTechnology.wastestreamProcesses"
            :busy="isFetching"
            :perPage="100"
          >
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
            <template v-for="fieldKey in Object.keys(headerDescriptions)" v-slot:[`cell(${fieldKey})`]="{ value }">
              <span :key="fieldKey" v-if="value" class="fa fa-check has-text-success"></span>
              <span :key="fieldKey" v-else>--</span>
            </template>
            <template v-slot:cell(title)="{ index, item }">
              {{ item.title }}
              <button
                class="button is-text icon-btn"
                @click="openModal('Process Operation/Wastestream Description', item.description)"
              >
                <span class="fa fa-info-circle"></span>
              </button>
            </template>
            <template v-slot:cell(secondary)="{ item }">
              <span v-html="item.secondary" />
            </template>
            <template v-slot:cell(goToLimitations)="{ item }">
              <span v-if="!item.noLimitations">
                <a @click="navigateToLimitations(item)">
                  <span class="fas fa-share-square limitation-link"></span>
                </a>
              </span>
            </template>
          </NewTable>
          <Modal v-if="shouldDisplayModal" :title="currentModalTitle" @close="shouldDisplayModal = false">
            <p class="has-text-left">
              <span v-html="currentModalContent" />
            </p>
          </Modal>
        </div>
      </template>
    </ControlTabs>

    <Modal v-if="shouldDisplayNotes" title="Level of Control Notes" @close="() => (shouldDisplayNotes = false)">
      <div class="control-notes" v-for="(note, index) in notes" :key="index">
        <h3><strong>CFR Section:</strong> {{ note.cfrSection }}</h3>
        <p><strong>Notes:</strong> {{ note.notes }}</p>
        <br />
      </div>
    </Modal>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Multiselect from 'vue-multiselect';
import Alert from '@/components/shared/Alert';
import ControlTabs from '@/components/shared/ControlTabs';
import NewTable from '@/components/shared/NewTable';
import Modal from '@/components/shared/Modal';

export default {
  components: { Alert, ControlTabs, NewTable, Modal, Multiselect },
  computed: {
    ...get('search', ['selectedCategory', 'categoryData', 'subcategoryData']),
    ...sync('results', ['activeTab']),
    ...sync('search', ['selectedSubcategory']),
  },
  data() {
    return {
      shouldDisplayModal: false,
      currentModalTitle: null,
      currentModalContent: null,
      shouldDisplayNotes: false,
      notes: null,
      isFetching: false,
      pscColumns: [
        {
          key: 'cfrSection',
          label: 'CFR Section',
        },
        {
          key: 'title',
          label: 'Process Operation/Wastestream',
        },
        {
          key: 'secondary',
          label: 'Other Process/Wastestream Detail(s)',
        },
        {
          key: 'zeroDischarge',
          label: 'Zero Discharge',
        },
        {
          key: 'includesBmps',
          label: 'BMPs',
        },
        {
          key: 'alternativeRequirement',
          label: 'Alternative Requirement',
        },
        {
          key: 'noLimitations',
          label: 'No Limitations',
        },
        {
          key: 'goToLimitations',
          label: 'Go to Limitations',
        },
      ],
      headerDescriptions: {
        zeroDischarge: 'There will be no discharge from the process operation or no discharge of the wastestream.',
        includesBmps:
          'Best Management Practices are included in the effluent limitations guidelines and standards for this process operation/wastestream.',
        alternativeRequirement:
          'Indicates that a facility has more than one option to meet the effluent limitations guidelines and standards.',
        noLimitations: 'EPA did not promulgate numeric or narrative pollutant limitations.',
      },
    };
  },
  methods: {
    openModal(title, content) {
      this.currentModalTitle = title;
      this.currentModalContent = content;
      this.shouldDisplayModal = true;
    },
    shouldDisplayNotesModal(notes) {
      this.notes = null;
      if (notes) {
        this.shouldDisplayNotes = true;
        this.notes = notes;
      }
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
          pollutantDescription: row.pollutantDescription,
        });
      }
      this.$router.push('/results/limitations');
    },
    changeControlTechTab(tabId) {
      this.activeTab = tabId;
    },
    async onChangeSubcategory(value) {
      this.selectedSubcategory = value;
      this.isFetching = true;
      if (value) {
        await this.$store.dispatch('search/getSubcategoryData');
        this.isFetching = false;
        const pscSelect = document.querySelector('.results-select');
        window.scrollTo(0, pscSelect.getBoundingClientRect().top + window.scrollY);
      } else {
        this.isFetching = false;
        this.$store.commit('search/SET_SUBCATEGORY_DATA', null);
      }
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

.cfr-link {
  margin-bottom: 1rem;
}

.psc-select {
  margin-bottom: 1.5rem;
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
  display: block;
  max-height: 8rem;

  .message-body {
    overflow: auto;
  }
}

.instructions-alert {
  margin-bottom: 0.5rem;
}

.technology-description {
  margin-right: 5px;
}

.is-gray-background {
  background-color: $gray;
}
</style>
