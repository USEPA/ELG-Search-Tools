<template>
  <a class="download-icon-container has-text-weight-bold" :href="`${apiBaseUrl}${url}&download=true`">
    <span class="fas fa-download"></span>
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
      apiBaseUrl: process.env.NODE_ENV === 'production' ? '/elg' : process.env.VUE_APP_API_URL,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.download-icon-container {
  display: block;
  width: fit-content;
  margin-left: auto;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: $blue;

  &:hover {
    text-decoration: underline;
  }

  .fas {
    font-size: 20px;
    margin-right: 3px;
  }
}
</style>
