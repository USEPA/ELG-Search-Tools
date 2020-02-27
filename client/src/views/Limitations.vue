<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3 has-text-black">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <h1 class="is-size-3 has-text-black has-text-weight-light">
      {{ category.pointSourceCategoryCode }}: {{ category.pointSourceCategoryName }}
    </h1>
    <h1 class="is-size-5 has-text-black has-text-weight-light">Subpart {{ subcategory.comboSubcategory }}</h1>
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
        <div class="column is-9">
          <p class="has-text-black info-box"><strong>CRF Section:</strong> {{ limitationData.cfrSection }}</p>
          <p class="has-text-black info-box">
            <strong>Level of Control:</strong> {{ limitationData.controlTechnologyCode }}
          </p>
          <p class="has-text-black info-box">
            <strong>Primary Wastestream/Process Operation:</strong> {{ limitationData.title }}
          </p>
          <p class="has-text-black info-box">
            <strong>Secondary Wastestream/Process Operation(s):</strong> {{ limitationData.secondary || '--' }}
          </p>
        </div>
        <div class="column">
          <button class="button has-text-white is-pulled-right" @click="onNavigate">
            <span class="fa fa-reply has-text-white"></span>Back to Results
          </button>
        </div>
      </div>
    </div>
    <Table :columns="columns" :rows="limitationData.limitations" :shouldHaveLimitationCols="true" />
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Table from '@/components/shared/Table';

export default {
  components: { Table },
  computed: {
    ...mapState('search', ['category', 'subcategory']),
    ...mapState('limitations', ['limitationData']),
  },
  data() {
    return {
      columns: [
        {
          key: 'pollutant',
          label: 'Pollutant',
        },
        {
          key: 'duration',
          label: 'Type of Limitation',
        },
        {
          key: 'dischargeFrequency',
          label: 'Frequency',
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'minimumValue',
          label: 'Minimum Level',
        },
      ],
    };
  },
  methods: {
    onNavigate() {
      this.$router.push('/results');
    },
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
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

.info-box {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}

.info-box-container {
  background-color: $gray !important;
  padding: 20px !important;
}
</style>
