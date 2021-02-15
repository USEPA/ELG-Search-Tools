<template>
  <div>
    <LoadingIndicator v-if="isFetching" />
    <div v-else-if="keywordResults" class="columns is-multiline">
      <div class="column is-6">
        <div class="info-box-container message">
          <div class="message-body content">
            <strong>Point Source Cateogry(ies):</strong>
            <ul>
              <li v-for="psc in keywordResults.pointSourceCategories" :key="psc.pointSourceCategoryCode">
                <!-- <button
                  class="button is-hyperlink"
                  title="View Point Source Category Results"
                  @click="goToPscResults(psc)"
                >
                  {{ psc.pointSourceCategoryCode }}: {{ psc.pointSourceCategoryName }}
                </button> -->
                {{ psc.pointSourceCategoryCode }}: {{ psc.pointSourceCategoryName }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="info-box-container message">
          <div class="message-body content">
            <strong>Process Operation(s)/Wastestream(s):</strong>
            <ul>
              <li v-for="wp in keywordResults.wastestreamProcesses" :key="wp.id" v-html="wp.title"></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="info-box-container message">
          <div class="message-body content">
            <strong>Pollutant(s):</strong>
            <ul>
              <li v-for="poll in keywordResults.pollutants" :key="poll.pollutantId">
                {{ poll.pollutantDescription }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="info-box-container message">
          <div class="message-body content">
            <strong>Treatment Technology(ies):</strong>
            <ul>
              <li v-for="train in keywordResults.treatmentTrains" :key="train.id">
                {{ train.names }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div>
      <DownloadLink title="Limitations" :url="keywordApiUrl" />
      <Table
        :columns="limitationColumns"
        :rows="tableProvider"
        :busy="isFetching"
        :perPage="100"
        :useServerPagination="true"
        :count="keywordResults ? keywordResults.count : 0"
        :apiUrl="keywordApiUrl"
      >
        <template v-slot:cell(wastestreamProcessTitle)="{ index, item }">
          {{ item.wastestreamProcessTitle }}
          <button class="button is-text icon-btn" @click="shouldDisplayProcess = index">
            <span class="fa fa-info-circle"></span>
          </button>
          <Modal v-if="shouldDisplayProcess === index" title="Description" @close="shouldDisplayProcess = false">
            <p class="has-text-left">
              <span v-html="item.wastestreamProcessDescription" />
            </p>
          </Modal>
        </template>
        <template v-slot:cell(treatmentNames)="{ index, item }">
          {{ item.treatmentNames }}
          <button
            class="button is-text icon-btn"
            @click="shouldDisplayNotes = index"
            title="Click to view Treatment Train Notes"
          >
            <span class="fa fa-info-circle"></span>
          </button>
          <Modal v-if="shouldDisplayNotes === index" title="Treatment Train Notes" @close="shouldDisplayNotes = false">
            <p class="has-text-left">
              <span
                v-html="
                  item.wastestreamProcessTreatmentTechnologyNotes +
                    ' (' +
                    item.wastestreamProcessTreatmentTechnologySourceTitle +
                    ')'
                "
              />
            </p>
          </Modal>
        </template>
        <template v-slot:cell(goToLta)="{ item }">
          <span v-if="item.longTermAverageCount > 0">
            <a @click="onShouldDisplayLongTermAvgData(item.limitationId)">
              <span class="fas fa-share-square limitation-link"></span>
            </a>
          </span>
          <span v-else>--</span>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import { call, get } from 'vuex-pathify';
import Table from '@/components/shared/Table';
import Modal from '@/components/shared/Modal';
import DownloadLink from '@/components/shared/DownloadLink';

export default {
  components: { Table, Modal, DownloadLink },
  computed: {
    ...get('customSearch', ['keywordResults', 'keywordApiUrl', 'isFetching']),
  },
  data() {
    return {
      shouldDisplayNotes: false,
      shouldDisplayProcess: false,
      limitationColumns: [
        {
          key: 'pointSourceCategoryName',
          label: 'Point Source Category',
        },
        {
          key: 'controlTechnologyCfrSection',
          label: 'CFR Section',
        },
        {
          key: 'comboSubcategory',
          label: 'Subpart',
        },
        {
          key: 'controlTechnologyCode',
          label: 'Level of Control',
        },
        {
          key: 'pollutantDescription',
          label: 'Pollutant',
        },
        {
          key: 'wastestreamProcessTitle',
          label: 'Process',
        },
        {
          key: 'treatmentNames',
          label: 'Treatment Train',
        },
        {
          key: 'limitationValue',
          label: 'Value',
        },
        {
          key: 'limitationUnitCode',
          label: 'Units',
        },
        {
          key: 'limitationDurationTypeDisplay',
          label: 'Type of Limitation',
        },
        {
          key: 'goToLta',
          label: 'Go To LTA',
          sortable: false,
        },
      ],
    };
  },
  methods: {
    ...call('customSearch', ['getKeywordResults']),
    onShouldDisplayLongTermAvgData(limitationId) {
      this.$store.dispatch('limitations/getLongTermAvgDataTechSearch', limitationId);
      this.$router.push('/results/limitations/longTermAverage');
    },
    async tableProvider(ctx) {
      try {
        const response = await this.$http.get(
          `${ctx.apiUrl}&offset=${ctx.currentPage * ctx.perPage - 100}&sortCol=${ctx.sortBy}&sortDir=${
            ctx.sortDesc ? 'desc' : 'asc'
          }`
        );
        this.$store.commit('customSearch/SET_KEYWORD_RESULTS', response.data);
        return response.data.limitations.map((row) => {
          return {
            ...row,
            limitationValue:
              row.limitationValue !== null ? row.limitationValue : `${row.minimumValue} - ${row.maximumValue}`,
          };
        });
      } catch (error) {
        return [];
      }
    },
    // async goToPscResults(psc) {
    //   this.$store.commit('search/SET_SELECTED_CATEGORY', psc);
    //   await this.$store.dispatch('search/getPointSourceCategories');
    //   this.$store.commit('customSearch/SET_KEYWORD_RESULTS', null);
    // },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.button {
  width: 100%;
  margin-top: 0.5rem;

  &[disabled] {
    background-color: whitesmoke;
    color: inherit;

    &:hover {
      background-color: #fff;
    }
  }
}

.fa-info-circle {
  color: $blue;
}

a .fa {
  font-size: 1.25rem;
}

.pollutant-subtext {
  margin-bottom: 1rem;
}

section p {
  padding-bottom: 0 !important;
}

.info-box-container {
  height: 100%;
  max-height: 250px;
  width: 100%;
  margin-bottom: 1rem;
  overflow: hidden;

  .message-body {
    overflow: auto;
  }

  .button {
    display: inline-block;
    width: auto;
    font-size: 15px;
  }

  ul {
    padding-left: 0;
    padding-bottom: 0;
    margin-top: 0.5rem;
    margin-bottom: 0;

    li {
      margin-top: 0;
      font-size: 15px;
    }
  }
}
</style>
