<template>
  <div class="loading">
    <div class="spinner"></div>
    <div>{{ message }}</div>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.loading {
  text-align: center !important;

  .spinner {
    display: inline-block;
    margin: 10px;
    border: 13px solid $gray;
    border-top: 13px solid $lightBlue;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
  }

  &.dark .spinner {
    border: 4px solid $darkBlue;
    border-top: 4px solid $lightBlue;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
