<template>
  <div class="field has-addons">
    <p class="control">
      <a class="button is-static has-background-grey-lighter has-text-black is-medium">
        Browse By:
      </a>
    </p>
    <p class="control">
      <span class="select is-medium">
        <select class="has-background-grey-lighter has-text-weight-semibold is-medium">
          <option>Select Category</option>
          <option>Point Source Category</option>
          <option>Pollutant</option>
          <option>Treatment Technology</option>
        </select>
      </span>
    </p>
    <p class="control is-expanded">
      <input class="input is-medium" type="text" />
    </p>
    <p class="control">
      <button class="button is-medium">
        <span class="fa fas fa-search has-text-white"></span>
      </button>
    </p>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

button {
  width: 100px;
  background: $darkBlue;
  border-color: $darkBlue;
}
</style>
