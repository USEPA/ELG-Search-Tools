<template>
  <div>
    <Alert v-if="addError !== null" :message="addError" type="error"></Alert>
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-2">Dashboard</h1>
      </div>
      <div class="column has-text-right">
        <Button
          class="is-size-5"
          label="Add QAPP"
          type="success"
          @click.native="() => (shouldShowAdd = true)"
          :shouldShowIcon="true"
          icon="plus"
        />
      </div>
    </div>
    <Table
      :columns="columns"
      :rows="rows"
      :shouldHaveActionsCol="true"
      noDataMessage="No QAPPs available. Add a QAPP to continue."
      @onEdit="editQapp"
      @onDelete="onDeleteQapp"
    />
    <SideNav
      v-if="shouldShowAdd"
      :handleShown="clearName"
      :handleClose="() => (shouldShowAdd = false)"
      title="Add QAPP"
    >
      <!-- #deafult="props" gives us access to SideNav's props from inside this template tag -->
      <template #default="props">
        <form id="addQappForm" @submit.prevent="handleSubmit">
          <div class="field">
            <label class="label" for="title">QAPP Title</label>
            <input
              id="title"
              class="input"
              type="text"
              required
              placeholder="Enter a title"
              v-model="title"
              maxlength="255"
            />
          </div>
          <hr />
          <div class="field is-grouped">
            <div class="control">
              <Button label="Add" type="info" submit />
            </div>
            <div class="control">
              <Button label="Cancel" type="cancel" :preventEvent="true" @click.native="props.close" />
            </div>
          </div>
        </form>
      </template>
    </SideNav>
    <DeleteWarning
      v-if="shouldShowDelete"
      title="Delete QAPP"
      :itemLabel="selectedQapp.title"
      @close="() => (shouldShowDelete = false)"
      @onDelete="handleDeleteQapp"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import SideNav from '@/components/shared/SideNav';
import Button from '@/components/shared/Button';
import Table from '@/components/shared/Table';
import DeleteWarning from '@/components/shared/DeleteWarning';
import Alert from '@/components/shared/Alert';

export default {
  components: { SideNav, Button, Table, DeleteWarning, Alert },
  async mounted() {
    // 241 - handle the "no qapp found" error gracefully
    if (this.$route.params.notFound === '1') this.addError = 'The requested QAPP was not found.';
    this.$store.commit('qapp/CLEAR_CURRENT_QAPP');
    this.getQapps();
    this.getSections();
  },
  methods: {
    ...mapActions('qapps', ['getQapps']),
    ...mapActions('structure', ['getSections']),
    async onDeleteQapp(qapp) {
      this.shouldShowAdd = false;
      this.shouldShowDelete = true;
      this.selectedQapp = qapp;
    },
    clearName() {
      this.title = '';
    },
    async handleSubmit() {
      this.addError = null;
      await this.$store
        .dispatch('qapps/add', {
          userId: this.$auth.user().id,
          questionId: 1,
          value: this.title,
          archived: false,
        })
        .catch((error) => {
          this.addError = error.response.data.error;
        });
      if (this.addError === null) this.$router.push({ name: 'navigate', params: { id: this.$store.state.qapp.id } });
    },
    editQapp(qapp) {
      this.$store.commit('qapp/SET_CURRENT_QAPP', qapp);
      this.$router.push({ name: 'navigate', params: { id: qapp.id } });
    },
    async handleDeleteQapp() {
      await this.$store.dispatch('qapps/delete', this.selectedQapp.id);
      this.$store.commit('qapp/CLEAR_CURRENT_QAPP');
      this.shouldShowDelete = false;
    },
  },
  data() {
    return {
      shouldShowAdd: false,
      shouldShowDelete: false,
      columns: [
        {
          key: 'title',
          label: 'Title',
        },
        {
          key: 'updatedAt',
          label: 'Date Updated',
        },
        {
          key: 'progress',
          label: 'Progress',
        },
      ],
      title: '',
      selectedQapp: null,
      addError: null,
    };
  },
  computed: {
    ...mapState('structure', ['sections']),
    qapps() {
      return this.$store.state.qapps.data;
    },
    rows() {
      return this.qapps.map((qapp) => {
        return {
          id: qapp.id,
          title: qapp.data.find((d) => d.questionId === 1) ? qapp.data.find((d) => d.questionId === 1).value : '',
          updatedAt: qapp.updatedAt.substring(0, 10),
          progress: `${Math.round((qapp.completedSections.length / this.sections.length) * 100)}%`,
        };
      });
    },
  },
};
</script>
