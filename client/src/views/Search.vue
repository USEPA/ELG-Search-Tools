<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title is-size-2 has-text-black">
          Effluent Limitations Guidelines and Standards (ELG) Database
        </h1>
        <p class="has-text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <SearchBar />
      </div>
    </div>
    <div class="colunns">
      <div class="column is-2 is-offset-10 adv-search">
        <a class="has-text-black is-link">Advanced Search</a>
      </div>
    </div>
  </section>
</template>

<script>
import SearchBar from '@/components/shared/SearchBar';

export default {
  beforeCreate() {
    document.body.className = 'search';
  },
  data() {
    return {};
  },
  components: {
    SearchBar,
  },
};
</script>

<style lang="scss" scoped>
h1 {
  margin-left: 20px;
}

p {
  margin-top: 5em;
  margin-bottom: 5em;
  text-align: center;
  font-size: 18px;
}

.adv-search {
  padding-left: 23px;
}
</style>
