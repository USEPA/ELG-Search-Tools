<template>
  <div>
    <Alert type="info" :isSlim="true">
      Instructions: type in keywords or phrases and press Enter to save after each word or phrase. Select the OR
      operator if you want results that include any of the keywords. Select the AND operator if you only want results
      that contain all keywords.
    </Alert>
    <form class="columns" @submit="getResults($event)">
      <div class="column">
        <label for="keywords">Keywords</label>
        <div class="field has-addons">
          <div class="control is-expanded">
            <VueSelect
              inputId="keywords"
              v-model="keyword"
              placeholder="Type a keyword and press Enter to save"
              taggable
              multiple
              required
              @option:created="keywordAdded"
            >
              <template #search="{attributes, events}">
                <input id="keywords" class="vs__search" :required="!keyword" v-bind="attributes" v-on="events" />
              </template>
            </VueSelect>
          </div>
          <div class="control">
            <button type="submit" class="button is-dark is-medium">
              <span :class="`fa has-text-white ${false ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
              Search
            </button>
          </div>
        </div>
      </div>
      <div class="column is-2">
        <label for="">Operator</label>
        <div class="field">
          <div class="control radios">
            <input id="operatorOR" name="operator" type="radio" value="OR" v-model="operator" />
            <label for="operatorOR">OR</label>

            <input id="operatorAND" name="operator" type="radio" value="AND" v-model="operator" />
            <label for="operatorAND">AND</label>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { sync } from 'vuex-pathify';

export default {
  computed: {
    ...sync('customSearch', ['keyword', 'operator']),
  },
  methods: {
    keywordAdded() {
      // Keep input focused after user adds a keyword (vue-select component does not do this by default)
      setTimeout(() => {
        document.getElementById('keywords').focus();
        document.getElementById('keywords').select();
      }, 10);
    },
    getResults(e) {
      // prevent default form submission (resolves browser "form is not connected" console errors)
      e.preventDefault();

      // If user has typed into the input box but not pressed Enter, still pass the entered value
      const inputValue = document.getElementById('keywords').value;
      if (inputValue) {
        this.keyword = [...this.keyword, inputValue];
      }
      this.$router.push('/results');
    },
  },
};
</script>

<style lang="scss" scoped>
label {
  font-weight: bold;
}

.radios label {
  font-weight: normal;
}

.button {
  margin-bottom: 0;
}

.input {
  height: 44px;
}

::v-deep .v-select {
  &,
  & .vs__dropdown-toggle {
    height: 100%;
  }

  .vs__dropdown-menu {
    display: none;
  }

  &.vs--open .vs__dropdown-toggle {
    border: 1px solid rgba(60, 60, 60, 0.26);
  }

  .vs__actions {
    display: none;
  }
}
</style>
