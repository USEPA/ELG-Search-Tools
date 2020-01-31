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
            <option value="">Select Category</option>
            <option>Point Source Category</option>
            <option>Pollutant</option>
            <option>Treatment Technology</option>
          </select>
        </span>
      </p>
      <p class="control is-expanded">
        <Multiselect
          v-model="category"
          :options="categoryList"
          :placeholder="option && `Select ${option}`"
          :custom-label="customLabel"
          @select="getSubCategories"
          :track-by="categoryCode"
          :loading="isLoadingCategories"
        ></Multiselect>
      </p>
      <p class="control">
        <button class="button is-medium" @click="onSubmit" :disabled="!subcategory">
          <span class="fa fas fa-search has-text-white"></span>
        </button>
      </p>
    </div>
    <div class="columns subcategory-select">
      <div class="column">
        <Multiselect
          v-if="category"
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
      categoryList: [],
      subcategory: null,
      subcategoryList: [],
      isLoadingCategories: false,
      isLoadingSubcategories: false,
      categoryCode: null,
      subcategoryCode: null,
    };
  },
  computed: {
    ...mapGetters('search', ['categories', 'subcategories']),
  },
  methods: {
    async onChangeCategory(e) {
      this.categoryList = [];
      this.category = null;
      this.isLoadingCategories = true;
      this.categoryCode = null;
      this.subcategory = null;
      const option = e.target.value;
      if (option === 'Point Source Category') {
        await this.$store.dispatch('search/get_PointSourceCategories');
        this.categoryList = this.categories;
        this.categoryCode = 'pointSourceCategoryCode';
        this.isLoadingCategories = false;
      } else {
        this.isLoadingCategories = false;
      }
    },
    async getSubCategories(value) {
      this.subcategoryList = [];
      this.subcategory = null;
      this.isLoadingSubcategories = true;
      this.subcategoryCode = null;
      if (this.option === 'Point Source Category') {
        await this.$store.dispatch('search/get_PointSourceSubcategories', value.pointSourceCategoryCode);
        this.$store.commit('search/SET_CATEGORY', value);
        this.subcategoryList = this.subcategories;
        this.subcategoryCode = 'pointSourceSubcategoryCode';
        this.isLoadingSubcategories = false;
      }
    },
    customLabel({ pointSourceCategoryCode, pointSourceCategoryName }) {
      if (this.categories.length) return `${pointSourceCategoryCode}: ${pointSourceCategoryName}`;
      return this.categories;
    },
    async onSubmit() {
      await this.$store.dispatch('search/getSubcategory', this.subcategory.id);
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
  width: 451px !important;
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
</style>
