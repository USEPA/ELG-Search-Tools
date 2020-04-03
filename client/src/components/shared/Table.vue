<template>
  <div>
    <div class="columns">
      <div class="column table-container">
        <table class="table is-fullwidth is-bordered">
          <thead>
            <tr>
              <th v-if="shouldHavePollCols || shouldHaveTreatmentTechCols">
                Select PSC
              </th>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
              <th v-if="shouldHaveResultsCols">
                Zero Discharge<a v-if="shouldHaveResultsCols" @click="$emit('onDisplayCheckboxInfo', 'zeroDischarge')"
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
              <th v-if="shouldHaveResultsCols || shouldHavePollCols || shouldHaveTechBasisCols">
                Go to Limitations
              </th>
              <th v-if="shouldHavePollLimitCols || shouldHaveLimitationCols">
                Go to LTA
              </th>
              <th v-if="shouldHaveTreatmentTechCols">
                Go to Technology Basis
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
              <td v-if="shouldHavePollCols || shouldHaveTreatmentTechCols">
                <input
                  class="is-checkradio is-info has-background-color psc"
                  type="checkbox"
                  :id="row.pointSourceCategoryCode"
                  :value="row.pointSourceCategoryCode"
                  @click="$emit('updatePollutantList', row.pointSourceCategoryCode)"
                /><label :for="row.pointSourceCategoryCode"></label>
              </td>
              <td v-for="column in columns" :key="column.key">
                <span v-if="column.isAbbreviatedList">
                  <span v-html="abbreviatedList(row[column.key]) + ' '"></span>
                  <br />
                  <a
                    class="is-link more"
                    v-if="row[column.key].split('<br/>').length > 2"
                    @click="$emit('shouldDisplayMoreModal', row[column.key])"
                    >more</a
                  >
                </span>
                <span v-else-if="column.key === 'rangeOfPollutantLimitations' && shouldHavePollCols">
                  <span v-html="row[column.key]"></span>
                </span>
                <span v-else-if="column.key === 'wastestreamProcessTitle' && shouldHavePollLimitCols">
                  {{ row[column.key] }}
                </span>
                <span v-else-if="column.key === 'secondary'" v-html="row[column.key]"></span>
                <span v-else-if="column.key === 'wastestreamProcessSecondary'" v-html="row[column.key]"></span>
                <span v-else-if="column.key === 'limitationDurationDescription'">
                  {{ row[column.key] ? row[column.key] : '--' }}
                  <a
                    v-if="
                      row.limitationDurationDescription &&
                        (row.wastestreamProcessLimitCalculationDescription ||
                          row.limitRequirementDescription ||
                          row.limitationPollutantNotes)
                    "
                    @click="$emit('onDisplayTypeOfLimitationModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
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
                <span v-else-if="column.key === 'longTermAverageValue'">
                  {{
                    row[column.key]
                      ? row['longTermAverageUnitCode']
                        ? row[column.key] + ' ' + row['longTermAverageUnitCode']
                        : row[column.key]
                      : '--'
                  }}
                  <a
                    v-if="row.longTermAverageValue && row.longTermAverageUnitCode && row.longTermAverageUnitDescription"
                    @click="$emit('onDisplayLtaUnitDescriptionModal', row)"
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
                <span v-else-if="column.key === 'wastestreamProcessZeroDischarge'">
                  {{ row[column.key] ? 'YES' : 'NO' }}
                </span>
                <span v-else>
                  {{ row[column.key] ? row[column.key] : '--' }}
                  <a v-if="column.key === 'title'" @click="$emit('onDisplayInfoModal', row)"
                    ><span class="fa fa-info-circle"></span
                  ></a>
                </span>
              </td>
              <td v-if="shouldHaveResultsCols">
                <span>{{ row.zeroDischarge ? 'YES' : 'NO' }}</span>
              </td>
              <td v-if="shouldHaveResultsCols">
                <span>{{ row.includesBmps ? 'YES' : 'NO' }}</span>
              </td>
              <td v-if="shouldHaveResultsCols">
                <span>{{ 'NO' }}</span>
              </td>
              <td v-if="shouldHaveResultsCols">
                <span>{{ row.noLimitations ? 'YES' : 'NO' }}</span>
              </td>
              <td
                v-if="
                  shouldHaveResultsCols ||
                    shouldHaveLimitationCols ||
                    shouldHavePollCols ||
                    shouldHavePollLimitCols ||
                    shouldHaveTreatmentTechCols ||
                    shouldHaveTechBasisCols
                "
              >
                <a
                  v-if="shouldHaveResultsCols || shouldHavePollCols || shouldHaveTechBasisCols"
                  @click="$emit('onNavigateToLimitations', row)"
                >
                  <span v-if="!row.noLimitations" class="fas fa-share-square limitation-link"></span>
                </a>
                <a
                  v-if="shouldHaveLimitationCols || shouldHavePollLimitCols"
                  @click="$emit('onShouldDisplayLongTermAvgData', row)"
                  ><span v-if="row.longTermAverageCount > 0" class="fas fa-share-square limitation-link"></span
                ></a>
                <a v-if="shouldHaveTreatmentTechCols" @click="$emit('onShouldDisplayTechnologyBasisData', row)">
                  <span class="fas fa-share-square limitation-link"></span>
                </a>
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
    shouldHaveTreatmentTechCols: {
      type: Boolean,
      required: false,
    },
    shouldHaveTechBasisCols: {
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
    abbreviatedList(value) {
      const shortList = value.split('<br/>');

      if (shortList.length >= 2) {
        return `${shortList[0]}<br/>${shortList[1]}`;
      }

      if (shortList.length === 1) {
        return value;
      }

      return '';
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
