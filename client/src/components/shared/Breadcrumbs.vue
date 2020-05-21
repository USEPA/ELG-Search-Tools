<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li v-for="page in pages" :key="page.path" :class="page.isCurrent ? 'is-active' : ''">
        <a v-if="page.isCurrent" href="#" aria-current="page">{{ page.title }}</a>
        <router-link v-else :to="page.path || page.pathObject">{{ page.title }}</router-link>
      </li>
    </ul>
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
.breadcrumb ul {
  padding-bottom: 0.5rem;
  padding-left: 0;
}
</style>
