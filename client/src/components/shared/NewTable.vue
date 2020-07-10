<template>
  <div class="table-container">
    <BTable
      :fields="tableColumns"
      :items="rows"
      :sticky-header="height"
      :busy="busy"
      :striped="true"
      :responsive="true"
      :per-page="perPage"
      :current-page="currentPage"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      @head-clicked="changeSort"
    >
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot" />

      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </BTable>

    <BPagination v-if="perPage" v-model="currentPage" :total-rows="totalRows" :per-page="perPage" :limit="11" />
  </div>
</template>

<script>
import { BTable, BPagination } from 'bootstrap-vue';

export default {
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
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
  },
  components: { BTable, BPagination },
  data() {
    return {
      sortBy: this.defaultSort || '',
      sortDesc: false,
      tableColumns: [],
      currentPage: 1,
      totalRows: 0,
    };
  },
  watch: {
    columns() {
      this.buildTableColumns();
    },
    rows() {
      this.totalRows = this.rows.length;
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
    changeSort(key) {
      return key;
    },
  },
  mounted() {
    this.totalRows = this.rows.length;
    this.buildTableColumns();
  },
};
</script>

<style lang="scss" scoped>
.table-container {
  ::v-deep {
    .b-table-sticky-header {
      overflow: auto;
      .b-table th {
        position: sticky;
        position: -webkit-sticky;
        z-index: 9;
        top: -1px;
      }
    }
    .b-table {
      width: 100%;
      font-size: 0.95rem;
      border-collapse: separate;
      border-spacing: 0;
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
    .b-pagination {
      margin: 1rem 0 0 0;
      display: flex;
      padding-left: 0;
      list-style: none;
      border-radius: 0.25rem;
      justify-content: start;
      .page-item.disabled .page-link {
        color: #6c757d;
        pointer-events: none;
        cursor: auto;
        background-color: #fff;
        border-color: #dee2e6;
      }
      .page-item:first-child .page-link {
        margin-left: 0;
        border-top-left-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
      }
      .page-item.active .page-link {
        z-index: 3;
        color: #fff;
        background-color: #005ea2;
        border-color: #005ea2;
      }
      .page-link {
        position: relative;
        display: block;
        padding: 0.5rem 0.75rem;
        margin-left: -1px;
        margin-bottom: 0;
        line-height: 1.25;
        color: #005ea2;
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 0;
      }
      .page-link {
        max-width: inherit;
      }
    }
  }
}
</style>
