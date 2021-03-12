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
        <a @click="$router.go(-1)" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Limitations
        </a>
      </div>
    </div>
    <div class="elg-header-container">
        <h2 class="is-size-4 has-text-weight-bold page-heading">
          Long-Term Averages
        </h2>
    </div>
    <Alert type="info">
      A long-term average (LTA) is the average pollutant concentration that is achieved over a period of time. It is the
      mean of the underlying statistical distribution of the daily effluent values used to calculate numeric pollutant
      limitations.
    </Alert>
    <div v-if="longTermAvgData" class="info-box-container message">
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
        <p><span class="has-text-weight-bold">Level of Control:</span> {{ longTermAvgData.controlTechnologyCode }}</p>
        <p>
          <span class="has-text-weight-bold">Process Operation/Wastestream:</span>
          {{ longTermAvgData.wastestreamProcessCfrSection }}
          {{ longTermAvgData.wastestreamProcessTitle }}
        </p>
        <p>
          <span class="has-text-weight-bold">Other Process/Wastestream Details:</span>
          <span v-html="longTermAvgData.wastestreamProcessSecondary"></span>
        </p>
        <p><span class="has-text-weight-bold">Pollutant:</span> {{ longTermAvgData.pollutantDescription }}</p>
      </div>
    </div>
    <DownloadLink title="Long Term Averages" :url="`/api/limitation?id=${selectedLimitationId}`" />
    <Table v-if="longTermAvgData" :columns="longTermAvgCols" :rows="longTermAvgData.longTermAverages">
      <template v-slot:cell(treatmentTechnologyNames)="{ item }">
        {{ item.treatmentTechnologyNames }}
        <button
          class="button is-text icon-btn"
          @click="
            openModal(
              'Treatment Train Notes',
              `${item.wastestreamProcessTreatmentTechnologyNotes} (${item.wastestreamProcessTreatmentTechnologySourceTitle})`
            )
          "
          title="Click to view Treatment Train Notes"
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:cell(longTermAverageUnitCode)="{ item, index }">
        <HoverText
          :hoverId="`ltaUnits${index}`"
          :linkText="item.longTermAverageUnitCode"
          :customStyle="{ width: '200px' }"
        >
          {{ item.longTermAverageUnitDescription }}
        </HoverText>
      </template>
    </Table>
    <Modal v-if="shouldDisplayModal" :title="currentModalTitle" @close="shouldDisplayModal = false">
      <p class="has-text-left">
        <span v-html="currentModalContent" />
      </p>
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Alert from '@/components/shared/Alert';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';
import HoverText from '@/components/shared/HoverText';
import DownloadLink from '@/components/shared/DownloadLink';

export default {
  components: { Alert, Breadcrumbs, Table, Modal, HoverText, DownloadLink },
  computed: {
    ...mapState('search', ['selectedTreatmentTrain']),
    ...mapState('limitations', ['longTermAvgData', 'selectedLimitationId']),
  },
  data() {
    return {
      shouldDisplayModal: false,
      currentModalTitle: null,
      currentModalContent: null,
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
          key: 'longTermAverageUnitCode',
          label: 'LTA Units',
        },
        {
          key: 'limitationValue',
          label: 'Limitation Value',
        },
        {
          key: 'limitationUnitCode',
          label: 'Limitation Units',
        },
        {
          key: 'limitationUnitBasis',
          label: 'Limitation Basis',
        },
        {
          key: 'longTermAverageSourceTitle',
          label: 'LTA Reference',
        },
      ],
    };
  },
  methods: {
    openModal(title, content) {
      this.currentModalTitle = title;
      this.currentModalContent = content;
      this.shouldDisplayModal = true;
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
</style>
