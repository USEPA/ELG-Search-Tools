<template>
  <div>
    <LoadingIndicator v-if="isFetching" />

    <div v-else-if="keywordResults">
      <div class="message is-slim">
        <div class="message-body content">
          <strong>Keywords:</strong>
          {{ keyword.join(', ') }}
        </div>
      </div>

      <h3 class="is-size-5 has-text-weight-bold">
        Summary of Keyword Hits
        <HoverText hoverId="keywordHitsInfo" :icon="true">
          Keyword hits are summarized by type of information stored in the ELG Database. The Keyword Results Table
          presents the pollutant limitation results associated with the keyword search.
        </HoverText>
      </h3>
      <div class="columns is-multiline keyword-hits">
        <div class="column is-6">
          <strong>
            Point Source Category(ies):
            <HoverText hoverId="pscKeywordInfo" :icon="true">
              Keyword found in point source category title, subcategory title, or applicability statements.
            </HoverText>
          </strong>
          <div class="info-box-container message">
            <div class="message-body content">
              <p v-if="keywordResults.pointSourceCategories.length === 0">
                No keyword hits. See the pollutant limitation results associated with the keyword search in the Keyword
                Results Table.
              </p>
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
          <strong>
            Process Operation(s)/Wastestream(s):
            <HoverText hoverId="processKeywordInfo" :icon="true">
              Keyword found in process operation/wastestream title, description, or narrative requirements.
            </HoverText>
          </strong>
          <div class="info-box-container message">
            <div class="message-body content">
              <p v-if="keywordResults.wastestreamProcesses.length === 0">
                No keyword hits. See the pollutant limitation results associated with the keyword search in the Keyword
                Results Table.
              </p>
              <ul>
                <li v-for="wp in keywordResults.wastestreamProcesses" :key="wp.id" v-html="wp.title"></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <strong>
            Pollutant(s):
            <HoverText hoverId="pollKeywordInfo" :icon="true">
              Keyword found in limitation requirement.
            </HoverText>
          </strong>
          <div class="info-box-container message">
            <div class="message-body content">
              <p v-if="keywordResults.pollutants.length === 0">
                No keyword hits. See the pollutant limitation results associated with the keyword search in the Keyword
                Results Table.
              </p>
              <ul>
                <li v-for="poll in keywordResults.pollutants" :key="poll.pollutantId">
                  {{ poll.pollutantDescription }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <strong>
            Treatment Technology(ies):
            <HoverText hoverId="treatmentKeywordInfo" :icon="true">
              Keyword found in treatment technology name or description.
            </HoverText>
          </strong>
          <div class="info-box-container message">
            <div class="message-body content">
              <p v-if="keywordResults.treatmentTrains.length === 0">
                No keyword hits. See the pollutant limitation results associated with the keyword search in the Keyword
                Results Table.
              </p>
              <ul>
                <li v-for="train in keywordResults.treatmentTrains" :key="train.id">
                  {{ train.names }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3 class="is-size-5 has-text-weight-bold table-header">
        Keyword Results Table
        <HoverText hoverId="keywordResultsTableInfo" :icon="true">
          The Keyword Results Table presents pollutant limitations associated with the criteria.
        </HoverText>
      </h3>
      <DownloadLink title="Limitations" :url="keywordApiUrl" class="download-link" />
      <Table
        class="keyword-table"
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
          <button class="button is-text icon-btn" aria-label="View Process info" @click="shouldDisplayProcess = index">
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
            aria-label="Click to view Treatment Train Notes"
          >
            <span class="fa fa-info-circle"></span>
          </button>
          <Modal v-if="shouldDisplayNotes === index" title="Treatment Train Notes" @close="shouldDisplayNotes = false">
            <p class="has-text-left">
              <span
                v-html="
                  item.wastestreamProcessTreatmentTechnologyNotes +
                    (item.wastestreamProcessTreatmentTechnologySourceTitle
                      ? ' (' + item.wastestreamProcessTreatmentTechnologySourceTitle + ')'
                      : '')
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
import HoverText from '@/components/shared/HoverText';

export default {
  components: { Table, Modal, DownloadLink, HoverText },
  computed: {
    ...get('customSearch', ['keyword', 'keywordResults', 'keywordApiUrl', 'isFetching']),
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
      this.$router.push('/results/limitations/long-term-average');
    },
    async tableProvider(ctx) {
      try {
        const response = await this.$http.get(
          `${ctx.apiUrl}&offset=${ctx.currentPage * ctx.perPage - 100}&sortCol=${ctx.sortBy}&sortDir=${
            ctx.sortDesc ? 'desc' : 'asc'
          }`
        );
        this.$store.commit('customSearch/SET_KEYWORD_RESULTS', response.data);
        return response.data.limitations;
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

h3 {
  margin-bottom: 1rem;
}

.table-header {
  display: inline-block;
}

.download-link {
  float: right;
}

.keyword-table {
  clear: both;
}

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

.keyword-hits {
  margin-bottom: 1rem;
}

.message.is-slim {
  display: inline-block;

  .message-body {
    padding: 0.5rem 1rem;
  }
}

.info-box-container {
  height: 100%;
  max-height: 130px;
  width: 100%;
  margin-bottom: 0;
  overflow: hidden;

  .message-body {
    padding: 1rem;
    overflow: auto;
  }

  .button {
    display: inline-block;
    width: auto;
    font-size: 15px;
  }

  p {
    font-style: italic;
    font-size: 15px;
  }

  ul {
    padding-left: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;

    li {
      margin-top: 0;
      font-size: 15px;
    }
  }
}
</style>
