<template>
  <div class="table-container">
    <UsTable
      :class="`${filterableFields.length ? 'filter-table' : ''}`"
      :columns="tableColumns"
      :rows="filtered"
      :rowProvider="useServerData ? rows : null"
      :height="height"
      :busy="isBusy"
      :emptyText="emptyText"
      :perPage="perPage"
      :total="totalRows"
      :apiUrl="apiUrl"
      :defaultSort="sortBy"
      @sort-changed="sortChanged"
    >
      <div slot="empty">
        <div v-if="isBusy" class="text-center">
          <LoadingIndicator />
        </div>
        <div v-else class="text-center">
          {{ emptyText }}
        </div>
      </div>

      <!-- Hard-coded slots that are on multiple instances of table -->
      <template v-slot:head(limitationUnitBasis)="{ field }">
        {{ field.label }}
        <button
          class="usa-button is-text icon-btn"
          aria-label="View limitation unit basis info"
          @click.stop="
            openModal(
              '',
              'The Limitation Basis column is included as a tool to sort the numerical limitations in the ELG Database. The ELG may require conversion of concentration-based to mass-based limitations. See the Type of Limitation information or CFR for more details.'
            )
          "
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>
      <template v-slot:head(goToLta)="{ field }">
        {{ field.label }}
        <button
          class="usa-button is-text icon-btn"
          aria-label="View long term average info"
          @click.stop="openModal('', 'If no LTA data are available for the pollutant, no link will be shown.')"
        >
          <span class="fa fa-info-circle"></span>
        </button>
      </template>

      <template v-slot:cell(limitationUnitCode)="{ item }">
        <HoverText
          :hoverId="`units${item.limitationId}-${item.treatmentId}`"
          :linkText="item.limitationUnitCode"
          :customStyle="{ width: '200px' }"
        >
          {{ item.limitationUnitDescription }}
        </HoverText>
      </template>
      <template v-slot:cell(limitationValue)="{ item, index }">
        <span v-if="item.limitationValue">
          <HoverText
            v-if="item.alternateLimitFlag && item.alternateLimitFlag !== '<' && item.alternateLimitFlag !== '>='"
            :id="`flagMinHover${index}`"
            :linkText="
              item.alternateLimitFlag === 'ADJUST' || item.alternateLimitFlag === 'X by Factor'
                ? item.alternateLimitFlag
                : item.limitationValue
            "
          >
            <div v-if="item.pointSourceCategoryCode === 419" class="cfr-link is-pulled-right">
              <a
                title="Electronic Code of Federal Regulations"
                :href="`https://www.ecfr.gov/cgi-bin/text-idx?node=pt40.31.419#se40.31.${item.cfrSectionAnchor}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                eCFR <span class="fa fa-external-link-alt" />
              </a>
              <br />
            </div>
            <div v-if="item.alternateLimitFlag === 'ADJUST' || item.alternateLimitFlag === 'X by Factor'">
              Limitation Value: {{ item.limitationValue }} {{ item.limitationUnitCode }}
            </div>
            Limitation Flag: {{ item.alternateLimitFlag }} - {{ item.alternateLimitDescription }}
          </HoverText>
          <span v-else>{{ item.alternateLimitFlag }} {{ item.limitationValue }}</span>
          <span v-if="item.typoFlagLimitationValue">
            <button
              class="usa-button is-text icon-btn"
              aria-label="Click to view limitaiton value flag"
              @click="shouldDisplayTypoFlagLimitationValue = index"
              title="Click to view limitation value flag"
            >
              <span class="fa fa-exclamation-triangle"></span>
            </button>
            <Modal
              v-if="shouldDisplayTypoFlagLimitationValue === index"
              @close="shouldDisplayTypoFlagLimitationValue = false"
            >
              <div class="info-modal has-text-left">
                <span style="font-style: italic">
                  {{ item.typoFlagLimitationValue }}
                </span>
              </div>
            </Modal>
          </span>
        </span>
        <span v-else-if="item.minimumValue && item.maximumValue">
          {{ item.minimumValue }} - {{ item.maximumValue }}
        </span>
        <span v-else-if="item.minimumValue">{{ item.minimumValue }}</span>
        <span v-else-if="!item.limitationValue && item.alternateLimitFlag">
          <HoverText :id="`flagHover${index}`" :linkText="item.alternateLimitFlag">
            {{ item.alternateLimitDescription }}
          </HoverText>
        </span>
        <span v-else>--</span>
      </template>
      <template v-slot:cell(limitationDurationTypeDisplay)="{ index, item }">
        {{ item.limitationDurationTypeDisplay }}
        <button
          class="usa-button is-text icon-btn"
          aria-label="Click to view Description"
          @click="shouldDisplayLimitationType = index"
          title="Click to view Description"
        >
          <span class="fa fa-info-circle"></span>
        </button>
        <Modal v-if="shouldDisplayLimitationType === index" @close="shouldDisplayLimitationType = false">
          <div class="info-modal has-text-left">
            <h3 class="has-text-weight-bold">{{ item.limitationDurationDescription }}</h3>
            <div v-if="item.wastestreamProcessLimitCalculationDescription">
              <hr />
              <h3 class="has-text-weight-bold">Limitation Calculation Description</h3>
              <p>
                {{ item.wastestreamProcessLimitCalculationDescription }}
                <span v-if="item.wastestreamProcessTypoFlagLimitCalculationDescription">
                  <br />
                  <span class="fa fa-exclamation-triangle"></span>
                  <span style="font-style: italic">
                    {{ item.wastestreamProcessTypoFlagLimitCalculationDescription }}
                  </span>
                </span>
              </p>
            </div>
            <div v-if="item.limitRequirementDescription">
              <hr />
              <h3 class="has-text-weight-bold">Limitation Requirement Description</h3>
              <p>{{ item.limitRequirementDescription }}</p>
            </div>
            <div v-if="item.limitationPollutantNotes">
              <hr />
              <h3 class="has-text-weight-bold">Notes</h3>
              <p>{{ item.limitationPollutantNotes }}</p>
            </div>
          </div>
        </Modal>
      </template>

      <!-- Passthrough all slots and their data scope if applicable -->
      <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>

      <!-- Custom Filters row -->
      <template v-if="filterableFields.length" #top-row="{ fields }">
        <td v-for="field in fields" :key="field.key">
          <VueSelect
            v-if="filterableFields.map((f) => f.key).includes(field.key)"
            v-model="filterValues[field.key]"
            :options="getFilterOptions(field)"
            :placeholder="`Filter` /* `Select ${field.label}` */"
            class="table-filter"
          >
            <template #no-options>No available options.</template>
          </VueSelect>
        </td>
      </template>

      <template v-slot:cell()="{ value }">
        <span v-if="value === null || value === ''">--</span>
        <span v-else>{{ value }}</span>
      </template>
    </UsTable>

    <Modal v-if="shouldDisplayModal" :title="currentModalTitle" @close="shouldDisplayModal = false">
      <p class="has-text-left">
        <span v-html="currentModalContent" />
      </p>
    </Modal>
  </div>
</template>

<script>
import { UsTable } from 'hsrp-components';
import HoverText from './HoverText.vue';
import Modal from './Modal.vue';
import LoadingIndicator from './LoadingIndicator.vue';

export default {
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: [Array, Function],
      required: true,
    },
    height: {
      type: String,
      default: '500px',
    },
    defaultSort: {
      type: String,
    },
    busy: {
      type: Boolean,
      default: false,
    },
    perPage: {
      type: Number,
    },
    emptyText: {
      type: String,
      default: 'No data available.',
    },
    count: {
      type: Number,
      default: 0,
    },
    apiUrl: {
      type: String,
    },
  },
  components: { UsTable, HoverText, Modal, LoadingIndicator },
  data() {
    return {
      sortBy: this.defaultSort || '',
      sortDesc: false,
      tableColumns: [],
      currentPage: 1,
      totalRows: 0,
      shouldDisplayLimitationType: false,
      shouldDisplayTypoFlagLimitationValue: false,
      filterValues: {},
      shouldDisplayModal: false,
      currentModalTitle: null,
      currentModalContent: null,
      isBusy: this.busy,
    };
  },
  computed: {
    useServerData() {
      return typeof this.rows === 'function';
    },
    filterableFields() {
      return this.columns.filter((col) => col.filterable);
    },
    filtered() {
      if (this.useServerData) {
        return null;
      }
      if (this.rows.length > 0) {
        const filtered = this.rows.filter((item) => {
          return Object.keys(this.filterValues).every((key) =>
            String(item[key]).includes(this.filterValues[key] || '')
          );
        });
        return filtered.length > 0
          ? filtered
          : [
              Object.keys(this.rows[0]).reduce((obj, value) => {
                obj[value] = '';
                return obj;
              }, {}),
            ];
      }
      return this.rows;
    },
  },
  watch: {
    columns() {
      this.buildTableColumns();
      this.buildFilterValues();
    },
    rows() {
      this.totalRows = this.count ? this.count : this.rows.length;
    },
    count() {
      this.totalRows = this.count;
    },
    filtered() {
      this.positionFilterRow();
    },
    busy() {
      this.isBusy = this.busy;
    },
  },
  methods: {
    buildTableColumns() {
      this.tableColumns = this.columns.map((col) => {
        if (typeof col === 'string') {
          return {
            key: col,
            label: col,
            tdClass: 'text-center',
            sortable: true,
          };
        }
        return {
          key: col.key,
          label: col.label || col.key,
          tdClass: col.tdClass || 'text-center',
          sortable: col.sortable !== undefined ? col.sortable : true,
        };
      });
    },
    // For some reason, we need an event on header click in order for bootstrap-vue table to trigger sort
    sortChanged() {
      // Go back to page one when sorting on server-side
      if (this.useServerData) {
        this.currentPage = 1;
      }
    },
    buildFilterValues() {
      const filters = {};
      this.filterableFields.forEach((field) => {
        filters[field.key] = '';
      });
      this.filterValues = filters;
    },
    positionFilterRow() {
      const head = document.querySelector('.usa-table thead tr th');
      const filterCells = document.querySelectorAll('.top-row td');
      for (let i = 0; i < filterCells.length; i += 1) {
        filterCells[i].style.top = `${head.offsetHeight - 2}px`;
      }
    },
    openModal(title, content) {
      this.currentModalTitle = title;
      this.currentModalContent = content;
      this.shouldDisplayModal = true;
    },
    getFilterOptions(field) {
      if (this.useServerData) return [];
      const rawField = this.filterableFields.find((f) => f.key === field.key);
      let options = this.rows.map((row) => row[field.key]).filter((v, i, a) => a.indexOf(v) === i && !!v);
      // If options need to be sorted in specific way, check for "customFilterSort" prop in field object and sort accordingly
      if (rawField.customFilterSort) {
        options = rawField.customFilterSort.filter((val) => options.includes(val));
      }
      return options;
    },
  },
  created() {
    this.buildTableColumns();
    this.buildFilterValues();
  },
  mounted() {
    this.totalRows = this.useServerData ? this.count : this.rows.length;
    this.positionFilterRow();
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';
.table-container {
  :deep() {
    .usa-table-container--responsive {
      overflow: auto;
      border: 1px solid #dfe1e2;

      &:focus {
        outline: none;
      }
    }

    table.usa-table {
      margin: 0;
      font-size: 0.93rem;
      border-collapse: separate;
      min-width: 100%;

      &.usa-table--compact {
        font-size: 0.87rem;

        & th {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
      }

      th,
      td {
        text-align: center;
        vertical-align: middle;

        .usa-button {
          position: relative;
          z-index: 9;
          width: auto;
        }

        &.text-left {
          text-align: left;
        }
        &.text-right {
          text-align: right;
        }
      }

      thead th {
        position: sticky;
        top: 0;
        border: none;
        border-right: 1px solid #c9c9c9;
        border-bottom: 1px solid #c9c9c9;
        z-index: 99;

        &:last-child {
          border-right: none;
        }

        &:not([aria-sort]) {
          background: #dfe1e2;
        }
      }

      td {
        border: none;

        & > span {
          display: block;
          // max-width: 300px;
        }
      }

      & th[data-sortable] {
        padding-right: 1.5rem;
      }

      & th[data-sortable] .usa-table__header__button {
        position: absolute;
        background: none;
        border: none;
        top: 0;
        left: 1px;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        text-align: right;
        padding-right: 0.5rem;
        word-wrap: normal;
        transform: none;
        cursor: pointer;
      }

      .no-data-message > td {
        background-color: #fff;
        text-align: center;
        padding: 0.5rem;
        border: 1px solid #dfe1e2;
        border-top: none;
      }

      &[aria-busy='true'] {
        opacity: 0.6;
      }
    }

    .usa-pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .usa-pagination {
      &__item {
        height: 2rem;
        min-width: 2rem;
        margin-bottom: 0;
      }

      .fa-chevron-right {
        margin-left: 0.2em;
      }
    }
  }

  :deep() {
    .b-table-sticky-header {
      overflow: auto;
      border-bottom: 1px solid #f1f1f1;
      .b-table th {
        position: sticky;
        position: -webkit-sticky;
        z-index: 9;
        top: -1px;
      }
    }
    .top-row {
      td {
        // padding: 0 5px 5px 5px !important;
        padding: 0 !important;
        border-bottom: 1px solid #ddd !important;
        // border-right: 1px solid #fff !important;
        background-color: #dfe1e2;
        position: sticky;
        top: 0;
        z-index: 99;
      }
    }
    .filter-table th {
      border-bottom: none !important;
    }
    .b-table {
      width: 100%;
      font-size: 0.95rem;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #f1f1f1;
      td,
      thead th {
        border: none;
        padding: 0.6rem;
        vertical-align: middle;
        line-height: 1.25;
      }
      thead th {
        text-align: center;
        background-color: #f1f1f1 !important;
        border-right: 1px solid #fff;
        border-bottom: 1px solid #ddd;
        &[tabindex='0']:focus {
          outline-offset: -2px;
        }
        &[aria-sort] {
          cursor: pointer;
          padding-right: calc(0.75rem + 0.65em);
          background-position: right 0.375rem center;
          background-repeat: no-repeat;
          background-size: 0.65em 1em;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='101' height='101' preserveAspectRatio='none'><path opacity='.3' d='M51 1l25 23 24 22H1l25-22zm0 100l25-23 24-22H1l25 22z'/></svg>");
        }
        &[aria-sort='ascending'] {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='101' height='101' preserveAspectRatio='none'><path d='M51 1l25 23 24 22H1l25-22z'/><path opacity='.3' d='M51 101l25-23 24-22H1l25 22z'/></svg>");
        }
        &[aria-sort='descending'] {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='101' height='101' preserveAspectRatio='none'><path opacity='.3' d='M51 1l25 23 24 22H1l25-22z'/><path d='M51 101l25-23 24-22H1l25 22z'/></svg>");
        }
      }
      &.table-striped tbody tr:nth-of-type(even) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &[aria-busy='true'] {
        opacity: 0.55;
      }
    }

    .v-select {
      margin-bottom: 0;
      border-left: 1px solid #fff;
      border-right: 1px solid #fff;

      .vs__search {
        width: 0;
      }

      .vs__dropdown-toggle {
        height: auto;
      }

      .vs__selected {
        max-width: 5px;
      }
    }
  }
}

.fa-exclamation-triangle {
  color: $danger;
}
</style>
