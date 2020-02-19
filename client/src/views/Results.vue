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
        <button class="button has-text-white is-pulled-right" @click="onNavigate">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </button>
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
    <Tabs :tabs="subcategory.controlTechnologies" :directLength="directLength" :indirectLength="indirectLength">
      <template v-for="controlTechnology in subcategory.controlTechnologies" v-slot:[controlTechnology.id]>
        <div :key="controlTechnology.id" class="columns tab-content">
          <div class="column">
            <div class="field is-grouped">
              <div class="control is-expanded">
                <h1 class="is-size-6 has-text-black has-text-weight-semibold">
                  {{ controlTechnology.controlTechnologyDescription }} ({{ controlTechnology.controlTechnologyCode }})
                  at a Glance
                </h1>
              </div>
              <div class="control">
                <a
                  class="is-link"
                  v-if="controlTechnology.notes"
                  @click="shouldDisplayNotesModal(controlTechnology.notes)"
                  >Level of Control Notes</a
                >
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
                class="is-checkradio is-info is-rtl has-background-color is-static"
                id="BMP"
                type="checkbox"
                :checked="controlTechnology.includesBmp"
                @click="stopTheEvent($event)"
              />
              <label class="has-text-black" for="BMP"
                >Level of Control includes Best Management Practice (BMP) Requirements?</label
              >
            </div>
            <div class="field">
              <Table
                :columns="columns"
                :rows="controlTechnology.wastestreamProcesses"
                @onDisplayInfoModal="displayInfoModal"
              />
            </div>
          </div>
        </div>
      </template>
    </Tabs>
    <Modal v-if="shouldDisplayNotes" @close="() => (shouldDisplayNotes = false)">
      <div class="control-notes" v-for="(note, index) in notes" :key="index">
        <h3><strong>CFR Section:</strong> {{ note.cfrSection }}</h3>
        <p><strong>Notes:</strong> {{ note.notes }}</p>
      </div>
    </Modal>
    <Modal v-if="shouldDisplayInfoModal" @close="closeInfoModal">
      <div class="info-modal">
        <p><strong>Description:</strong> {{ currentRow.description }}</p>
      </div>
    </Modal>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import Tabs from '@/components/shared/Tabs';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';

export default {
  beforeCreate() {
    document.body.className = 'results';
  },
  mounted() {
    if (this.subcategory.controlTechnologies.length === 6) {
      this.directLength = '472px';
    } else {
      this.directLength = `${118 *
        this.subcategory.controlTechnologies.filter(
          (c) =>
            c.controlTechnologyCode === 'BPT' ||
            c.controlTechnologyCode === 'BCT' ||
            c.controlTechnologyCode === 'BAT' ||
            c.controlTechnologyCode === 'NSPS'
        ).length}px`;
      this.indirectLength = `${116 *
        this.subcategory.controlTechnologies.filter(
          (c) => c.controlTechnologyCode === 'PSES' || c.controlTechnologyCode === 'PSNS'
        ).length}px`;
    }
    this.subcategory.controlTechnologies.push({
      id: 'about',
      controlTechnologyCode: `About Part ${this.category.pointSourceCategoryCode}`,
    });
  },
  components: { Tabs, Table, Modal },
  computed: {
    ...mapState('search', ['category', 'subcategory']),
  },
  data() {
    return {
      directLength: null,
      indirectLength: null,
      shouldDisplayNotes: false,
      notes: null,
      currentRow: null,
      shouldDisplayInfoModal: false,
      columns: [
        {
          key: 'cfrSection',
          label: 'CFR Section',
        },
        {
          key: 'title',
          label: 'Process Wasteream',
        },
        {
          key: 'secondary',
          label: 'Secondary Wasteream',
        },
      ],
    };
  },
  methods: {
    onNavigate() {
      this.$router.push('/');
    },
    shouldDisplayNotesModal(notes) {
      this.notes = null;
      if (notes) {
        this.shouldDisplayNotes = true;
        this.notes = notes;
      }
    },
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    closeInfoModal() {
      this.currentRow = null;
      this.shouldDisplayInfoModal = false;
    },
    displayInfoModal(row) {
      this.shouldDisplayInfoModal = true;
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

.is-checkradio[type='checkbox'] + label {
  cursor: auto;
}
</style>
