<template>
  <nav class="usa-breadcrumb" aria-label="breadcrumbs">
    <ol class="usa-breadcrumb__list">
      <li
        v-for="page in pages"
        :key="page.path"
        :class="`usa-breadcrumb__list-item ${page.isCurrent ? 'usa-current' : ''}`"
      >
        <span v-if="page.isCurrent" href="#" aria-current="page">{{ page.title }}</span>
        <router-link v-else :to="page.path || page.pathObject" class="usa-breadcrumb__link">{{
          page.title
        }}</router-link>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  props: {
    pages: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.usa-breadcrumb {
  padding-top: 0;
}
</style>
