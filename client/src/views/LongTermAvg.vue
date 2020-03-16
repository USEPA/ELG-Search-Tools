<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="field is-grouped help-icons">
      <div class="field is-grouped">
        <span class="fas fa-book has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
      </div>
      <div class="field is-grouped help-container">
        <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
        <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
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
            Other Process Operation/Wastestream Detail(s): {{ longTermAvgData.wastestreamProcessSecondary }}
          </p>
        </div>
        <div class="column">
          <button class="button has-text-white is-pulled-right" @click="onNavigateLimitations">
            <span class="fa fa-reply has-text-white"></span>Back to Limitations
          </button>
        </div>
      </div>
    </div>
    <Table :columns="longTermAvgCols" :rows="longTermAvgData.longTermAverages" />
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Table from '@/components/shared/Table';

export default {
  components: { Table },
  computed: {
    ...mapState('limitations', ['longTermAvgData']),
  },
  data() {
    return {
      longTermAvgCols: [
        {
          key: 'Treatment Train',
          label: 'Treatment Train',
        },
        {
          key: 'Pollutant',
          label: 'Pollutant',
        },
        {
          key: 'LTA Value',
          label: 'LTA Value',
        },
        {
          key: 'Basis',
          label: 'Basis',
        },
        {
          key: 'LTA Notes',
          label: 'LTA Notes',
        },
        {
          key: 'LTA Reference',
          label: 'LTA Reference',
        },
      ],
    };
  },
  methods: {
    onNavigateLimitations() {
      this.$store.commit('limitations/SET_LTA_DATA', null);
      this.$router.push('/limitations');
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
