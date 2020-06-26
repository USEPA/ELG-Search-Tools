<template>
  <section class="section">
    <div class="columns elg-breadcrumbs-container">
      <div class="column">
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Limitations', path: '/results/limitations' },
            { title: 'Long Term Average', isCurrent: true },
          ]"
        />
      </div>
      <div class="column">
        <router-link to="/results/limitations" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Limitations
        </router-link>
      </div>
    </div>
    <div class="columns elg-header-container">
      <div class="column">
        <h2 class="is-size-4 has-text-weight-bold page-heading">
          Long-Term Averages
        </h2>
      </div>
      <div class="column help-icons">
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
    <div class="info-box-container message">
      <div class="message-body">
        <p v-if="selectedTreatmentTrain !== null">
          <span class="has-text-weight-bold">Treatment Train:</span> {{ selectedTreatmentTrain.names }}
        </p>
        <p>
          <span class="has-text-weight-bold">Point Source Category:</span>
          {{ longTermAvgData.pointSourceCategoryCode }}:
          {{ longTermAvgData.pointSourceCategoryName }}
        </p>
        <p><span class="has-text-weight-bold">Subpart:</span> {{ longTermAvgData.comboSubcategory }}</p>
        <p><span class="has-text-weight-bold">Control Technology:</span> {{ longTermAvgData.controlTechnologyCode }}</p>
        <p>
          <span class="has-text-weight-bold">Process Operation/Wastestream:</span>
          {{ longTermAvgData.wastestreamProcessCfrSection }}
          {{ longTermAvgData.wastestreamProcessTitle }}
        </p>
        <p>
          <span class="has-text-weight-bold">Other Process Operation/Wastestream Detail(s):</span>
          <span v-html="longTermAvgData.wastestreamProcessSecondary"></span>
        </p>
        <p><span class="has-text-weight-bold">Pollutant:</span> {{ longTermAvgData.pollutantDescription }}</p>
      </div>
    </div>
    <Table
      :columns="longTermAvgCols"
      :rows="longTermAvgData.longTermAverages"
      @onDisplayUnitDescriptionModal="displayUnitDescriptionModal"
      @onDisplayLtaUnitDescriptionModal="displayLtaUnitDescriptionModal"
    />
    <Modal v-if="shouldDisplayUnitDescriptionModal" @close="() => (shouldDisplayUnitDescriptionModal = false)">
      <div class="info-modal">
        <h3 v-if="currentRow.limitationUnitDescription"><strong>Limitation Unit Description</strong></h3>
        <p>{{ currentRow.limitationUnitDescription }}</p>
      </div>
    </Modal>
    <Modal v-if="shouldDisplayLtaUnitDescriptionModal" @close="() => (shouldDisplayLtaUnitDescriptionModal = false)">
      <div class="info-modal">
        <h3 v-if="currentRow.longTermAverageUnitDescription"><strong>LTA Unit Description</strong></h3>
        <p>{{ currentRow.longTermAverageUnitDescription }}</p>
      </div>
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  components: { Breadcrumbs, Table, Modal },
  computed: {
    ...mapState('search', ['selectedTreatmentTrain']),
    ...mapState('limitations', ['longTermAvgData']),
  },
  data() {
    return {
      shouldDisplayUnitDescriptionModal: false,
      shouldDisplayLtaUnitDescriptionModal: false,
      longTermAvgCols: [
        {
          key: 'treatmentTechnologyNames',
          label: 'Treatment Train',
        },
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'longTermAverageValue',
          label: 'LTA Value',
        },
        {
          key: 'alternateLimitFlag',
          label: 'Limitation Flag',
        },
        {
          key: 'limitationValue',
          label: 'Limitation Value',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
        },
        {
          key: 'longTermAverageNotes',
          label: 'LTA Notes',
        },
        {
          key: 'longTermAverageSourceTitle',
          label: 'LTA Reference',
        },
      ],
    };
  },
  methods: {
    displayUnitDescriptionModal(row) {
      this.currentRow = null;
      this.shouldDisplayUnitDescriptionModal = true;
      this.currentRow = row;
    },
    displayLtaUnitDescriptionModal(row) {
      this.currentRow = null;
      this.shouldDisplayLtaUnitDescriptionModal = true;
      this.currentRow = row;
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

.download-icon-container {
  justify-content: flex-end;
  margin-bottom: 0;
}
</style>
