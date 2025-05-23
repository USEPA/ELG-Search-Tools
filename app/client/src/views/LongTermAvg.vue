<template>
  <section class="section">
    <div class="elg-breadcrumbs-container">
      <div>
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', path: '/results' },
            { title: 'Limitations', path: '/results/limitations' },
            { title: 'Long Term Average', isCurrent: true },
          ]"
        />
      </div>
      <div>
        <a @click="$router.go(-1)" class="usa-button usa-button--unstyled">
          <span class="fa fa-reply has-text-white"></span>Back to Limitations
        </a>
      </div>
    </div>
    <div class="elg-header-container">
      <h2 class="is-size-4 has-text-weight-bold page-heading">Long-Term Averages</h2>
    </div>
    <Alert v-if="!longTermAvgData && !isFetching" type="error">
      You must come to this page from a results page.
      <router-link to="/" class="has-text-dark">Return Home</router-link> to run a search and view long term averages.
    </Alert>
    <Alert v-else type="info">
      A long-term average (LTA) is the average pollutant concentration that is achieved over a period of time. It is the
      mean of the underlying statistical distribution of the daily effluent values used to calculate numeric pollutant
      limitations.
    </Alert>
    <Alert v-if="longTermAvgData" type="">
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
          <span class="has-text-weight-bold">Other Process/Wastestream Details: </span>
          <span v-html="longTermAvgData.wastestreamProcessSecondary"></span>
        </p>
        <p><span class="has-text-weight-bold">Pollutant:</span> {{ longTermAvgData.pollutantDescription }}</p>
      </div>
    </Alert>
    <DownloadLink
      v-if="longTermAvgData"
      title="Long Term Averages"
      :url="`/api/limitation?id=${selectedLimitationId}`"
    />
    <Table v-if="longTermAvgData" :columns="longTermAvgCols" :rows="longTermAvgData.longTermAverages">
      <template v-slot:cell(treatmentTechnologyNames)="{ item }">
        {{ item.treatmentTechnologyNames }}
        <button
          class="usa-button is-text icon-btn"
          @click="
            openModal(
              'Treatment Train Notes',
              `${item.wastestreamProcessTreatmentTechnologyNotes} (${item.wastestreamProcessTreatmentTechnologySourceTitle})`
            )
          "
          title="Click to view Treatment Train Notes"
          aria-label="Click to view Treatment Train Notes"
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
import Alert from '@/components/shared/Alert.vue';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import Table from '@/components/shared/Table.vue';
import Modal from '@/components/shared/Modal.vue';
import HoverText from '@/components/shared/HoverText.vue';
import DownloadLink from '@/components/shared/DownloadLink.vue';

export default {
  components: { Alert, Breadcrumbs, Table, Modal, HoverText, DownloadLink },
  computed: {
    ...mapState('search', ['selectedTreatmentTrain']),
    ...mapState('limitations', ['isFetching', 'longTermAvgData', 'selectedLimitationId']),
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

.page-heading {
  margin-bottom: 0.75rem;
}

.info-box-container {
  margin-bottom: 0;
}
</style>
