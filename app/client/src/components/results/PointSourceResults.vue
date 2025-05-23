<template>
  <div>
    <div class="grid-row info-boxes">
      <Alert class="grid-col" type="">
        <div class="message-body">
          <p><strong>Pollutant(s):</strong> {{ categoryData.pollutants }}</p>
        </div>
      </Alert>
      <Alert class="grid-col" type="">
        <div class="message-body">
          <p><strong>Treatment Technology(ies):</strong> {{ categoryData.technologyNames }}</p>
        </div>
      </Alert>
    </div>
    <div class="psc-select">
      <label class="sr-only" for="subcategory">Subpart</label>
      <VueSelect
        class="results-select"
        inputId="subcategory"
        name="subcategory"
        v-model="selectedSubcategory"
        @update:modelValue="onChangeSubcategory"
        :options="categoryData.pointSourceSubcategories"
        placeholder="Select Subcategory"
        label="comboSubcategory"
      >
        <template #option="option"> Subpart {{ option.comboSubcategory }} </template>
        <template #selected-option="option"> Subpart {{ option.comboSubcategory }} </template>
      </VueSelect>
      <HoverText hoverId="subcatInstructions" :icon="true">
        Select a Subcategory for details on the Level of Control (BPT, BAT, BCT, NSPS, PSES, PSNS) and process
        operations/wastestream requirements.
      </HoverText>
    </div>
    <Alert v-if="subcategoryData" type="info" style="margin-bottom: 1.25rem">
      Select the tabs below to view different levels of control. If there are no requirements for a level of control,
      "No data available" will be noted.
    </Alert>
    <ControlTabs v-if="subcategoryData" :activeTab="activeTab" @onTabClick="changeControlTechTab">
      <template
        v-for="controlTechnology in subcategoryData.controlTechnologies"
        v-slot:[controlTechnology.controlTechnologyCode]
      >
        <div :key="controlTechnology.id" class="tab-content">
          <div class="field is-grouped">
            <div class="control is-expanded">
              <h3 class="is-size-6 has-text-weight-semibold">
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
          <div class="grid-row info-boxes">
            <Alert type="" class="grid-col" v-if="controlTechnology.pollutants.length">
              <div class="message-body">
                <p><strong>Pollutant(s):</strong> {{ controlTechnology.pollutants }}</p>
              </div>
            </Alert>
            <Alert type="" class="grid-col" v-if="controlTechnology.technologyNames.length">
              <div class="message-body">
                <p><strong>Treatment Technology(ies):</strong> {{ controlTechnology.technologyNames }}</p>
              </div>
            </Alert>
          </div>
          <Table
            v-if="controlTechnology.wastestreamProcesses"
            :columns="pscColumns"
            :rows="controlTechnology.wastestreamProcesses"
            :busy="isFetching"
            :perPage="100"
            :emptyText="tableEmptyText"
          >
            <template v-for="fieldKey in Object.keys(headerDescriptions)" v-slot:[`head(${fieldKey})`]="data">
              {{ data.field.label }}
              <button
                :key="fieldKey"
                class="usa-button is-text icon-btn"
                @click="openModal(data.label, headerDescriptions[fieldKey])"
              >
                <span class="fa fa-info-circle"></span>
              </button>
            </template>
            <template
              v-for="fieldKey in Object.keys(headerDescriptions).filter(
                (fieldName) => fieldName !== 'alternativeRequirement'
              )"
              v-slot:[`cell(${fieldKey})`]="{ value }"
            >
              <span :key="fieldKey" v-if="value" class="fa fa-check has-text-success"></span>
              <span :key="`${fieldKey}-empty`" v-else>--</span>
            </template>
            <template v-slot:cell(alternativeRequirement)="{ index, item }">
              <span v-if="item.alternativeRequirement" class="fa fa-check has-text-success" />
              <span v-else-if="!item.alternativeRequirement && item.voluntaryRequirement">
                <span class="fa fa-check has-text-success" />
                <HoverText :id="`vipHover${index}`" :linkText="'(VIP)'"> Voluntary Incentives Program </HoverText>
              </span>
              <span v-else>--</span>
            </template>
            <template v-slot:cell(title)="{ index, item }">
              {{ item.title }}
              <button
                class="usa-button is-text icon-btn"
                @click="shouldDisplayLimitationType = index"
                title="Click to view Description"
              >
                <span class="fa fa-info-circle"></span>
              </button>
              <Modal v-if="shouldDisplayLimitationType === index" @close="shouldDisplayLimitationType = false">
                <div class="info-modal has-text-left">
                  <br />
                  <div class="cfr-link is-pulled-right">
                    <a
                      title="Electronic Code of Federal Regulations"
                      :href="`https://www.ecfr.gov/cgi-bin/text-idx?node=pt40.31.${selectedCategory.pointSourceCategoryCode}#se40.31.${item.cfrSectionAnchor}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      eCFR <span class="fa fa-external-link-alt" />
                    </a>
                  </div>
                  <br />
                  <h3 class="has-text-weight-bold">Description</h3>
                  <p>{{ item.description }}</p>
                  <div v-if="item.limitCalculationDescription">
                    <hr />
                    <h3 class="has-text-weight-bold">Limit Calculation Description</h3>
                    <p>
                      {{ item.limitCalculationDescription }}
                      <span v-if="item.typoFlagLimitCalculationDescription">
                        <br />
                        <span class="fa fa-exclamation-triangle"></span>
                        <span style="font-style: italic">{{ item.typoFlagLimitCalculationDescription }}</span>
                      </span>
                    </p>
                  </div>
                  <div v-if="item.notes">
                    <hr />
                    <h3 class="has-text-weight-bold">Notes</h3>
                    <p>
                      {{ item.notes }}
                      <span v-if="item.typoFlagNotes">
                        <br />
                        <span class="fa fa-exclamation-triangle"></span>
                        <span style="font-style: italic">{{ item.typoFlagNotes }}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </Modal>
            </template>
            <template v-slot:cell(secondary)="{ item }">
              <span v-if="item.secondary !== ''" v-html="item.secondary" />
              <span v-else>--</span>
            </template>
            <template v-slot:cell(goToLimitations)="{ item }">
              <span v-if="!item.noLimitations && !item.zeroDischarge && item.limitationCount > 0">
                <a @click="navigateToLimitations(item)">
                  <span class="fas fa-share-square limitation-link"></span>
                </a>
              </span>
              <span v-else>--</span>
            </template>
          </Table>
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
import { mapState } from 'vuex';
import Alert from '@/components/shared/Alert.vue';
import ControlTabs from '@/components/shared/ControlTabs.vue';
import Table from '@/components/shared/Table.vue';
import Modal from '@/components/shared/Modal.vue';
import HoverText from '@/components/shared/HoverText.vue';
import { mapStatesToComputed } from '../../store';

export default {
  components: { Alert, ControlTabs, Table, Modal, HoverText },
  computed: {
    ...mapState('search', ['selectedCategory', 'categoryData', 'subcategoryData']),
    ...mapStatesToComputed('results', ['activeTab']),
    ...mapStatesToComputed('search', ['selectedSubcategory']),
    tableEmptyText() {
      if (
        this.selectedCategory.pointSourceCategoryCode === 414 &&
        ['I', 'J', 'K'].includes(this.subcategoryData.pointSourceSubcategoryCode)
      ) {
        return 'Refer to Subcategories B through H for process operations and requirements.';
      }
      return undefined;
    },
  },
  data() {
    return {
      shouldDisplayModal: false,
      shouldDisplayLimitationType: false,
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
          sortable: false,
        },
      ],
      headerDescriptions: {
        zeroDischarge: 'There will be no discharge from the process operation or no discharge of the wastestream.',
        includesBmps:
          'Best Management Practices are included in the effluent limitations guidelines and standards for this process operation/wastestream. See the information for the Process Operation/Wastestream for details.',
        alternativeRequirement:
          'Indicates that a facility has more than one option to meet the effluent limitations guidelines and standards.',
        noLimitations: 'The EPA did not promulgate numeric or narrative pollutant limitations.',
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
  async mounted() {
    // If PSC only has one subcategory, automatically select that category
    if (this.categoryData.pointSourceSubcategories.length === 1) {
      [this.selectedSubcategory] = this.categoryData.pointSourceSubcategories;
      this.isFetching = true;
      await this.$store.dispatch('search/getSubcategoryData');
      this.isFetching = false;
    }
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
  margin-bottom: 0 !important;
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

  .hover-info-container {
    margin-left: 0.5rem;
    font-size: 1.2rem;
  }
}

.results-select {
  display: inline-block;
  width: auto;
  min-width: 500px;
  height: 2.5rem;

  :deep() {
    .vs__selected {
      font-size: 1rem;
    }
  }

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

.fa-exclamation-triangle {
  color: $danger;
}
</style>
