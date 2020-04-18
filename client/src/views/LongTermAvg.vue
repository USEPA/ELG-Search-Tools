<template>
  <section class="section">
    <div class="columns">
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
    <div class="content info-box-container">
      <div class="columns">
        <div class="column is-8">
          <h1 class="info-box">{{ longTermAvgData.pollutantDescription }}</h1>
          <p class="info-box">Control Technology: {{ longTermAvgData.controlTechnologyCode }}</p>
          <p class="info-box">
            Part {{ longTermAvgData.pointSourceCategoryCode }}:
            {{ longTermAvgData.pointSourceCategoryName }}
          </p>
          <p class="info-box">Subpart {{ longTermAvgData.comboSubcategory }}</p>
          <p class="info-box">
            Process Operation/Wastestream: {{ longTermAvgData.wastestreamProcessCfrSection }}
            {{ longTermAvgData.wastestreamProcessTitle }}
          </p>
          <p class="info-box">
            Other Process Operation/Wastestream Detail(s):
            <span v-html="longTermAvgData.wastestreamProcessSecondary"></span>
          </p>
        </div>
        <div class="column">
          <router-link to="/results/limitations" class="button has-text-white is-pulled-right">
            <span class="fa fa-reply has-text-white"></span>Back to Limitations
          </router-link>
        </div>
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

.info-box {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.info-box-container {
  background-color: $gray !important;
  padding: 20px !important;
}

.download-icon-container {
  justify-content: flex-end;
  margin-bottom: 0;
}
</style>
