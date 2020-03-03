<template>
  <div>
    <div class="columns">
      <div class="column table-container">
        <table class="table is-fullwidth is-bordered">
          <thead>
            <tr>
              <th v-if="shouldHavePollCols">
                Select PSC
              </th>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
              <th v-if="shouldHaveResultsCols || shouldHaveLimitationCols || shouldHavePollLimitCols">
                Zero Discharge<a
                  v-if="shouldHaveResultsCols || shouldHavePollLimitCols"
                  @click="$emit('onDisplayCheckboxInfo', 'zeroDischarge')"
                  ><span class="fa fa-info-circle checkbox-info"></span
                ></a>
              </th>
              <th v-if="shouldHaveResultsCols">
                BMPS<a @click="$emit('onDisplayCheckboxInfo', 'bmps')"
                  ><span class="fa fa-info-circle checkbox-info"></span
                ></a>
              </th>
              <th v-if="shouldHaveResultsCols">
                Alternative Requirement<a @click="$emit('onDisplayCheckboxInfo', 'alternativeReq')"
                  ><span class="fa fa-info-circle checkbox-info"></span
                ></a>
              </th>
              <th v-if="shouldHaveResultsCols">
                No Limitations<a @click="$emit('onDisplayCheckboxInfo', 'noLimitations')"
                  ><span class="fa fa-info-circle checkbox-info"></span
                ></a>
              </th>
              <th v-if="shouldHaveResultsCols || shouldHavePollCols">
                Go to Limitations
              </th>
              <th v-if="shouldHavePollLimitCols">
                Go to LTA
              </th>
              <th v-if="shouldHaveLimitationCols">
                More Details
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
              <td :colspan="7">
                {{ noDataMessage }}
              </td>
            </tr>
            <tr v-for="(row, index) in rows" :key="index">
              <td v-if="shouldHavePollCols">
                <input
                  class="is-checkradio is-info has-background-color psc"
                  type="checkbox"
                  :id="row.pointSourceCategoryCode"
                  :value="row.pointSourceCategoryCode"
                  @click="$emit('updatePollutantList', row.pointSourceCategoryCode)"
                /><label :for="row.pointSourceCategoryCode"></label>
              </td>
              <td v-for="column in columns" :key="column.key">
                {{
                  column.key === 'limitationValue' && row['limitationUnitCode']
                    ? row['limitationValue'] + ' ' + row['limitationUnitCode']
                    : column.key === 'limitationValue' && !row['limitationValue']
                    ? '--'
                    : row[column.key]
                }}
                <a v-if="column.key === 'title'" @click="$emit('onDisplayInfoModal', row)"
                  ><span class="fa fa-info-circle"></span
                ></a>
                <a
                  v-if="column.key === 'cfrSection' && (row.notes || row.limitCalculationDescription)"
                  @click="$emit('onDisplayCFRModal', row)"
                  ><span class="fa fa-info-circle"></span
                ></a>
              </td>
              <td v-if="shouldHaveResultsCols || shouldHaveLimitationCols || shouldHavePollLimitCols">
                <input
                  class="is-checkradio is-info has-background-color static"
                  type="checkbox"
                  :checked="row.zeroDischarge"
                  @click="stopTheEvent($event)"
                /><label></label>
              </td>
              <td v-if="shouldHaveResultsCols">
                <input
                  class="is-checkradio is-info has-background-color static"
                  type="checkbox"
                  :checked="row.includesBmps"
                  @click="stopTheEvent($event)"
                /><label></label>
              </td>
              <td v-if="shouldHaveResultsCols">
                <input
                  class="is-checkradio is-info has-background-color static"
                  type="checkbox"
                  :checked="false"
                  @click="stopTheEvent($event)"
                /><label></label>
              </td>
              <td v-if="shouldHaveResultsCols">
                <input
                  class="is-checkradio is-info has-background-color static"
                  type="checkbox"
                  :checked="row.noLimitations"
                  @click="stopTheEvent($event)"
                /><label></label>
              </td>
              <td
                v-if="
                  shouldHaveResultsCols || shouldHaveLimitationCols || shouldHavePollCols || shouldHavePollLimitCols
                "
              >
                <a v-if="shouldHaveResultsCols || shouldHavePollCols" @click="$emit('onNavigateToLimitations', row)"
                  ><span v-if="!row.noLimitations" class="fas fa-share-square limitation-link"></span
                ></a>
                <a v-if="shouldHaveLimitationCols || shouldHavePollLimitCols"
                  ><span class="fas fa-share-square limitation-link"></span
                ></a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
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
      default: 'No data available.',
    },
    shouldHaveResultsCols: {
      type: Boolean,
      required: false,
    },
    shouldHaveLimitationCols: {
      type: Boolean,
      required: false,
    },
    shouldHavePollCols: {
      type: Boolean,
      required: false,
    },
    shouldHavePollLimitCols: {
      type: Boolean,
      required: false,
    },
  },
  components: { LoadingIndicator },
  computed: {
    rowSpanValue() {
      return groupBy(this.rows, 'pollutant');
    },
  },
  methods: {
    stopTheEvent(e) {
      e.preventDefault();
      e.stopPropagation();
    },
  },
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
  color: $blue;
  font-size: 25px;
}

.fa-info-circle {
  color: $blue;
}

th {
  text-align: center !important;
}

.is-checkradio.static[type='checkbox'] + label {
  cursor: auto;
}

.is-checkradio.psc[type='checkbox'] + label {
  margin-left: -10px;
}

.checkbox-info {
  color: gray;
}
</style>
