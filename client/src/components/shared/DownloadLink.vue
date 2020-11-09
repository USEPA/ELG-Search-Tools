<template>
  <a
    class="download-icon-container has-text-grey-dark is-size-7 has-text-weight-bold"
    :href="`${apiBaseUrl}${url}&download=true`"
  >
    <span class="fas fa-download help-icon"></span>
    Download {{ title }} (Excel File)
  </a>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Limitations',
    },
  },
  data() {
    return {
      apiBaseUrl: process.env.NODE_ENV === 'production' ? '' : process.env.VUE_APP_API_URL,
    };
  },
};
</script>

<style lang="scss" scoped>
.download-icon-container {
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-bottom: 0.5rem;
}
</style>
