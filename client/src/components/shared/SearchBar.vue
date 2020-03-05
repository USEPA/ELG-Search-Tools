<template>
  <div>
    <div class="field has-addons">
      <p class="control">
        <a class="button is-static has-background-grey-lighter has-text-black is-medium">
          Browse By:
        </a>
      </p>
      <p class="control">
        <span class="select is-medium">
          <select
            class="has-background-grey-lighter has-text-weight-semibold is-medium"
            v-model="option"
            @change="onChangeCategory($event)"
          >
            <option value="">Select Search Criteria</option>
            <option>Point Source Category</option>
            <option>Pollutant</option>
            <option>Treatment Technology</option>
          </select>
        </span>
      </p>
      <p class="control is-expanded">
        <Multiselect
          v-model="category"
          :options="list"
          :placeholder="option && `Select ${option}`"
          :custom-label="
            (option === 'Point Source Category' && customLabel) ||
              (option === 'Pollutant' && customLabelPoll) ||
              (() => {})
          "
          @select="getSubCategories"
          :track-by="code"
          :loading="isLoading"
        ></Multiselect>
      </p>
      <p class="control">
        <button
          class="button is-medium"
          @click="onSubmit"
          :disabled="!subcategory && option === 'Point Source Category'"
        >
          <span class="fa fas fa-search has-text-white"></span>
        </button>
      </p>
    </div>
    <div class="columns subcategory-select">
      <div class="column">
        <Multiselect
          v-if="category && option === 'Point Source Category'"
          v-model="subcategory"
          :options="subcategoryList"
          placeholder="Select Subcategory"
          label="comboSubcategory"
          :track-by="subcategoryCode"
          :loading="isLoadingSubcategories"
        ></Multiselect>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Multiselect from 'vue-multiselect';

export default {
  name: 'SearchBar',
  components: { Multiselect },
  data() {
    return {
      option: '',
      category: null,
      list: [],
      subcategory: null,
      subcategoryList: [],
      isLoading: false,
      isLoadingSubcategories: false,
      code: null,
      subcategoryCode: null,
      pollutantId: null,
    };
  },
  computed: {
    ...mapGetters('search', ['categories', 'subcategories', 'pollutants']),
  },
  methods: {
    async onChangeCategory(e) {
      this.list = [];
      this.category = null;
      this.isLoading = true;
      this.code = null;
      this.subcategory = null;
      const option = e.target.value;
      if (option === 'Point Source Category') {
        await this.$store.dispatch('search/getPointSourceCategories');
        this.list = this.categories;
        this.code = 'pointSourceCategoryCode';
        this.isLoading = false;
      } else if (option === 'Pollutant') {
        await this.$store.dispatch('search/getPollutants');
        this.list = this.pollutants;
        this.code = 'pollutantId';
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    },
    async getSubCategories(value) {
      this.subcategoryList = [];
      this.subcategory = null;
      this.isLoadingSubcategories = true;
      this.subcategoryCode = null;
      if (this.option === 'Point Source Category') {
        await this.$store.dispatch('search/getPointSourceSubcategories', value.pointSourceCategoryCode);
        this.$store.commit('search/SET_CATEGORY', value);
        this.subcategoryList = this.subcategories;
        this.subcategoryCode = 'pointSourceSubcategoryCode';
        this.isLoadingSubcategories = false;
      } else if (this.option === 'Pollutant') {
        this.pollutantId = value.pollutantId;
      }
    },
    customLabel({ pointSourceCategoryCode, pointSourceCategoryName }) {
      return `${pointSourceCategoryCode}: ${pointSourceCategoryName}`;
    },
    customLabelPoll({ pollutantDescription }) {
      return pollutantDescription;
    },
    async onSubmit() {
      if (this.option === 'Point Source Category') {
        await this.$store.dispatch('search/getSubcategory', this.subcategory.id);
      } else if (this.option === 'Pollutant') {
        await this.$store.dispatch('search/getPollutant', this.pollutantId);
      }
      await this.$router.push('results');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

button {
  width: 100px;
  background: $darkBlue;
  border-color: $darkBlue;
}

.button[disabled] {
  background-color: gray;
}

.subcategory-select {
  width: 609px !important;
  margin-left: 392px;
}

.field.has-addons {
  height: 44px;
}
</style>

<style lang="scss">
.multiselect__tags {
  min-height: 45px !important;
}

.multiselect__single {
  white-space: nowrap;
  overflow: hidden;
}
</style>
