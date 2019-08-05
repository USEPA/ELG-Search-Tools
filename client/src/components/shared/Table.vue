<template>
  <div>
    <div class="columns">
      <div class="column table-container">
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.label }}
              </th>
              <th v-if="shouldHaveActionsCol">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isFetching">
              <td :colspan="columns.length + (shouldHaveActionsCol ? 1 : 0)">
                <LoadingIndicator message="Loading..." class="dark" />
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td :colspan="columns.length + (shouldHaveActionsCol ? 1 : 0)">
                {{ noDataMessage }}
              </td>
            </tr>
            <tr v-for="(row, index) in rows" :key="index">
              <td v-for="column in columns" :key="column.key">
                {{ row[column.key] }}
              </td>
              <td v-if="shouldHaveActionsCol">
                <div class="field is-grouped">
                  <div class="control">
                    <Button
                      label="Edit"
                      type="primary"
                      icon="edit"
                      :shouldShowIcon="true"
                      @click.native="$emit('onEdit', row)"
                    />
                  </div>
                  <div class="control">
                    <Button
                      label="Delete"
                      type="danger"
                      icon="trash-alt"
                      :shouldShowIcon="true"
                      @click.native="$emit('onDelete', row)"
                    />
                  </div>
                </div>
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
import { mapState } from 'vuex';
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
  },
  components: { Button, LoadingIndicator },
  computed: {
    ...mapState('qapps', ['isFetching']),
  },
};
</script>

<style scoped>
.btn-container .button {
  margin-left: 1em;
  width: 6em;
}
</style>
