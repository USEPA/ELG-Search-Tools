<template>
  <span v-if="boolVal" class="fa fa-check has-text-success">
    <span class="sr-only">Yes</span>
  </span>
  <span v-else>--</span>
</template>

<script>
export default {
  props: {
    boolVal: Boolean,
  },
};
</script>

<style lang="scss" scoped></style>
