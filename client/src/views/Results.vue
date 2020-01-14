<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-3 has-text-black">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <h1 class="is-size-4 has-text-black">
          Search Results
        </h1>
      </div>
      <div class="column">
        <button class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </button>
      </div>
    </div>
    <h1 class="is-size-3 has-text-black has-text-weight-light">
      40 CFR 430: Pulp, Paper, and Paperboard Category
    </h1>
    <h1 class="is-size-5 has-text-black has-text-weight-light">
      Subpart B - Bleached Papergrade Kraft and Soda
    </h1>
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
    <Tabs :tabs="tabs">
      <template v-for="tab in tabs" v-slot:[tab.id]>
        <div :key="tab.id" class="columns tab-content">
          <div class="column">
            <div class="field is-grouped">
              <div class="control is-expanded">
                <h1 class="is-size-6 has-text-black has-text-weight-semibold">
                  Best Practicable Control Technology Currently Available (BPT) at a Glance
                </h1>
              </div>
              <div class="control">
                <a class="is-link">Level of Control Notes</a>
              </div>
            </div>
            <div class="field is-grouped">
              <p class="has-text-black"><b>Technology Name(s):</b> Chemical Precipitation,</p>
              <a class="is-link more">more</a>
            </div>
            <div class="field is-grouped">
              <p class="has-text-black"><b>Pollutant(s):</b> BOD5, pH, TSS,</p>
              <a class="is-link more">more</a>
            </div>
            <div class="field">
              <input
                class="is-checkradio is-info is-rtl has-background-color"
                id="BMP"
                type="checkbox"
                value="BMP"
                :checked="true"
              />
              <label class="has-text-black" for="BMP"
                >Level of Control includes Best Management Practice (BMP) Requirements?</label
              >
            </div>
            <div class="field">
              <Table :columns="columns" :rows="rows" />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
  </section>
</template>

<script>
import Tabs from '@/components/shared/Tabs';
import Table from '@/components/shared/Table';

export default {
  beforeCreate() {
    document.body.className = 'results';
  },
  components: { Tabs, Table },
  data() {
    return {
      tabs: [
        { id: 1, name: 'BPT' },
        { id: 2, name: 'BCT' },
        { id: 3, name: 'PSES' },
        { id: 4, name: 'PSNS' },
      ],
      columns: [
        {
          key: 'CFRSection',
          label: 'CFR Section',
        },
        {
          key: 'ProcessWasteream',
          label: 'Process Wasteream',
        },
        {
          key: 'SecondaryWasteream',
          label: 'Secondary Wasteream',
        },
      ],
      rows: [
        {
          CFRSection: '430.22.a',
          ProcessWasteream: 'Bleached kraft facilities',
          SecondaryWasteream: 'Market pulp',
          zeroDischargeCheckbox: true,
          bmpsCheckbox: true,
          voluntaryCheckbox: true,
          limitationsCheckbox: true,
        },
        {
          CFRSection: '430.22.a',
          ProcessWasteream: 'Bleached kraft facilities',
          SecondaryWasteream: 'Market pulp',
          zeroDischargeCheckbox: true,
          bmpsCheckbox: true,
          voluntaryCheckbox: true,
          limitationsCheckbox: true,
        },
        {
          CFRSection: '430.22.a',
          ProcessWasteream: 'Bleached kraft facilities',
          SecondaryWasteream: 'Market pulp',
          zeroDischargeCheckbox: true,
          bmpsCheckbox: true,
          voluntaryCheckbox: true,
          limitationsCheckbox: true,
        },
      ],
    };
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

section p {
  padding-bottom: 0 !important;
}
</style>
