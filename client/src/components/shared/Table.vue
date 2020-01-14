<template>
  <div>
    <div class="columns">
      <div class="column table-container">
        <table class="table is-fullwidth is-bordered">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
              <th v-if="shouldHaveActionsCol || shouldHaveSingleAction">
                Actions
              </th>
              <th>
                Zero Discharge
              </th>
              <th>
                BMPS
              </th>
              <th>
                Voluntary Requirement
              </th>
              <th>
                Go to Limitations
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isFetching">
              <td :colspan="columns.length">
                <LoadingIndicator message="Loading..." class="dark" />
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td :colspan="columns.length">
                {{ noDataMessage }}
              </td>
            </tr>
            <tr v-for="(row, index) in rows" :key="index">
              <td v-for="column in columns" :key="column.key">
                {{ row[column.key] }}
              </td>
              <td v-if="row.zeroDischargeCheckbox">
                <input
                  class="is-checkradio is-info has-background-color"
                  id="1"
                  type="checkbox"
                  value="BMP"
                  :checked="false"
                /><label></label>
              </td>
              <td v-if="row.bmpsCheckbox">
                <input
                  class="is-checkradio is-info has-background-color"
                  id="2"
                  type="checkbox"
                  value="BMP"
                  :checked="true"
                /><label></label>
              </td>
              <td v-if="row.voluntaryCheckbox">
                <input
                  class="is-checkradio is-info has-background-color"
                  id="3"
                  type="checkbox"
                  value="BMP"
                  :checked="false"
                /><label></label>
              </td>
              <td v-if="row.limitationsCheckbox">
                <span class="fas fa-share-square limitation-link"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="shouldHaveGlobalActions" class="has-text-right btn-container">
      <Button label="Add" type="success" @click.native="$emit('onAdd')" />
      <Button label="Delete All" type="danger" @click.native="$emit('onDelete')" :disabled="!rows.length" />
    </div>
  </div>
</template>

<script>
import Button from './Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

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
    noDataMessage: {
      type: String,
      required: false,
      default: 'No data available. Add data to continue.',
    },
    shouldHaveActionsCol: {
      type: Boolean,
      required: false,
    },
    shouldHaveGlobalActions: {
      type: Boolean,
      required: false,
    },
    shouldHaveSingleAction: {
      type: String,
      required: false,
    },
  },
  components: { Button, LoadingIndicator },
  computed: {},
  data() {
    return {
      isFetching: false,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.btn-container .button {
  margin-left: 1em;
  width: 6em;
}

.is-checkradio {
  margin-left: 10px !important;
}

label {
  padding-left: 0 !important;
}

.limitation-link {
  color: $lightBlue;
  font-size: 25px;
}

th {
  text-align: center !important;
}
</style>
