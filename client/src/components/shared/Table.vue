<template>
  <div class="table-container">
    <table class="table is-fullwidth is-bordered">
      <thead>
        <tr>
          <th v-if="canComparePscs">
            Select PSC
          </th>
          <th v-for="column in columnsToDisplay" :key="column.key">
            {{ column.label }}
          </th>
          <template v-if="shouldHaveResultsCols">
            <th>
              Zero Discharge<a @click="$emit('onDisplayCheckboxInfo', 'zeroDischarge')">
                <span class="fa fa-info-circle checkbox-info"></span>
              </a>
            </th>
            <th>
              BMPs<a @click="$emit('onDisplayCheckboxInfo', 'bmps')">
                <span class="fa fa-info-circle checkbox-info"></span>
              </a>
            </th>
            <th>
              Alternative Requirement<a @click="$emit('onDisplayCheckboxInfo', 'alternativeReq')">
                <span class="fa fa-info-circle checkbox-info"></span>
              </a>
            </th>
            <th>
              No Limitations<a @click="$emit('onDisplayCheckboxInfo', 'noLimitations')">
                <span class="fa fa-info-circle checkbox-info"></span>
              </a>
            </th>
          </template>
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
          <td v-if="canComparePscs">
            <input
              class="is-checkradio is-info has-background-color psc"
              type="checkbox"
              :id="row.pointSourceCategoryCode"
              :value="row.pointSourceCategoryCode"
              @click="$emit('onSelectedPsc', row, $event)"
            />
            <label :for="row.pointSourceCategoryCode"></label>
          </td>
          <td v-for="column in columnsToDisplay" :key="column.key">
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
            <span
              v-else-if="
                column.key === 'limitationValue' || column.key === 'minimumValue' || column.key === 'maximumValue'
              "
            >
              {{
                row[column.key]
                  ? row['limitationUnitCode']
                    ? row[column.key] + ' ' + row['limitationUnitCode']
                    : row[column.key]
                  : '--'
              }}
              <a
                v-if="row[column.key] && row.limitationUnitCode && row.limitationUnitDescription"
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
            <span v-else-if="column.key === 'alternateLimitFlag'">
              {{
                row[column.key]
                  ? row['alternateLimitDescription']
                    ? row[column.key] + ' ' + row['alternateLimitDescription']
                    : row[column.key]
                  : '--'
              }}
            </span>
            <YesNoIndicator
              v-else-if="column.key === 'wastestreamProcessTreatmentTechnologyZeroDischarge'"
              :boolVal="row[column.key]"
            />
            <span v-else-if="column.displayAsHTML">
              <span v-html="row[column.key] ? row[column.key] : '--'"></span>
            </span>
            <span v-else>
              {{ row[column.key] ? row[column.key] : '--' }}
              <a v-if="column.key === 'title'" @click="$emit('onDisplayInfoModal', row)">
                <span class="fa fa-info-circle"></span>
              </a>
            </span>
          </td>
          <template v-if="shouldHaveResultsCols">
            <td>
              <YesNoIndicator :boolVal="row.zeroDischarge" />
            </td>
            <td>
              <YesNoIndicator :boolVal="row.includesBmps" />
            </td>
            <td>
              <!-- TODO: Is this supposed to be hard-coded as false/no? -->
              <YesNoIndicator :boolVal="false" />
            </td>
            <td>
              <YesNoIndicator :boolVal="row.noLimitations" />
            </td>
          </template>
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
</template>

<script>
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import YesNoIndicator from '@/components/shared/YesNoIndicator';

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
    canComparePscs: {
      type: Boolean,
      required: false,
    },
    isComparingPscs: {
      type: Boolean,
      required: false,
    },
  },
  components: { LoadingIndicator, YesNoIndicator },
  computed: {
    columnsToDisplay() {
      let result = this.columns;

      if (this.shouldHavePollLimitCols && !this.isComparingPscs) {
        result = this.columns.filter(
          (col) => col.key !== 'pointSourceCategoryCode' && col.key !== 'pointSourceCategoryName'
        );
      } else if (this.shouldHaveTechBasisCols && !this.isComparingPscs) {
        result = this.columns.filter(
          (col) => col.key !== 'pointSourceCategoryCode' && col.key !== 'pointSourceCategoryName'
        );
      }

      return result;
    },
  },
  methods: {
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
