<template>
  <div :class="`usa-alert usa-alert--${type} ${isSlim ? 'usa-alert--slim' : ''}`" role="alert" tabindex="0">
    <div class="usa-alert__body">
      <span v-if="!message" class="alert-message"><slot /></span>
      <p v-else class="usa-alert__text">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    message: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: 'error',
    },
    isSlim: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
.usa-alert {
  overflow: unset;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1rem;

  ul {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0;
  }

  &--slim {
    margin-bottom: 0.75rem;
    display: inline-block;
    font-size: 0.93rem;
    overflow: hidden;
  }
}
</style>
