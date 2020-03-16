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
                  v-if="shouldHaveResultsCols || shouldHaveLimitationCols || shouldHavePollLimitCols"
                  @click="$emit('onDisplayCheckboxInfo', 'zeroDischarge')"
                  ><span class="fa fa-info-circle checkbox-info"></span
                ></a>
              </th>
              <th v-if="shouldHaveResultsCols">
                BMPs<a @click="$emit('onDisplayCheckboxInfo', 'bmps')"
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
              <th v-if="shouldHavePollLimitCols || shouldHaveLimitationCols">
                Go to LTA
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
              <td :colspan="colsLength">
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
                <span v-if="column.key === 'pointSourceSubcategories' && shouldHavePollCols"
                  ><span v-html="abbrvList(row[column.key]) + ' '"></span>
                  <br />
                  <a
                    class="is-link more"
                    v-if="row[column.key].split('<br/>').length > 2"
                    @click="$emit('shouldDisplayMoreModal', row[column.key])"
                    >more</a
                  >
                </span>
                <span v-if="column.key === 'wastestreamProcesses' && shouldHavePollCols"
                  ><span v-html="abbrvList(row[column.key]) + ' '"></span>
                  <br />
                  <a
                    class="is-link more"
                    v-if="row[column.key].split('<br/>').length > 2"
                    @click="$emit('shouldDisplayMoreModal', row[column.key])"
                    >more</a
                  >
                </span>
                <span v-if="column.key === 'wastestreamProcessTitle' && shouldHavePollLimitCols">
                  {{ row['wastestreamProcessCfrSection'] + ' ' + row[column.key] }}
                </span>
                <span v-if="column.key === 'secondary'" v-html="row[column.key]"></span>
                <span v-if="column.key === 'wastestreamProcessSecondary'" v-html="row[column.key]"></span>
                <span v-else-if="column.key === 'limitationValue'">
                  {{
                    row[column.key]
                      ? row['limitationUnitCode']
                        ? row[column.key] + ' ' + row['limitationUnitCode']
                        : row[column.key]
                      : '--'
                  }}
                  <a
                    v-if="row.limitationValue && row.limitationUnitCode && row.limitationUnitDescription"
                    @click="$emit('onDisplayUnitDescriptionModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
                <span v-else-if="column.key === 'minimumValue'">
                  {{
                    row[column.key]
                      ? row['limitationUnitCode']
                        ? row[column.key] + ' ' + row['limitationUnitCode']
                        : row[column.key]
                      : '--'
                  }}
                  <a
                    v-if="row.minimumValue && row.limitationUnitCode && row.limitationUnitDescription"
                    @click="$emit('onDisplayUnitDescriptionModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
                <span v-else-if="column.key === 'maximumValue'">
                  {{
                    row[column.key]
                      ? row['limitationUnitCode']
                        ? row[column.key] + ' ' + row['limitationUnitCode']
                        : row[column.key]
                      : '--'
                  }}
                  <a
                    v-if="row.maximumValue && row.limitationUnitCode && row.limitationUnitDescription"
                    @click="$emit('onDisplayUnitDescriptionModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
                <span v-else-if="column.key === 'alternateLimitFlag'">
                  {{
                    row[column.key]
                      ? row['alternateLimitDescription']
                        ? row[column.key] + ' ' + row['alternateLimitDescription']
                        : row[column.key]
                      : '--'
                  }}
                </span>
                <span
                  v-else-if="
                    column.key !== 'wastestreamProcesses' &&
                      column.key !== 'pointSourceSubcategories' &&
                      column.key !== 'wastestreamProcessTitle'
                  "
                >
                  {{ row[column.key] ? row[column.key] : '--' }}
                  <a v-if="column.key === 'title'" @click="$emit('onDisplayInfoModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
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
                <a
                  v-if="shouldHaveLimitationCols || shouldHavePollLimitCols"
                  @click="$emit('onShouldDisplayLongTermAvgData', row)"
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
    colsLength: {
      type: Number,
      required: false,
      default: 8,
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
    abbrvList(value) {
      let abbrv = '';
      const shortList = value.split('<br/>');
      if (shortList.length >= 2) {
        abbrv = `${shortList[0]}<br/> ${shortList[1]}`;
      } else if (shortList.length === 1) {
        return value;
      }
      return abbrv;
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
  display: block;
}
</style>
