<template>
  <div class="loading-indicator" role="alert">
    <div class="spinner"></div>
    <div class="label sr-only">Loading</div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../static/variables';

.loading-indicator {
  text-align: center;
  clear: both;

  .spinner {
    display: inline-block;
    margin: 10px;
    border: 13px solid $gray;
    border-top: 13px solid $blue;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    animation: spin 2s linear infinite;
  }

  &.dark .spinner {
    border: 13px solid $darkBlue;
    border-top: 13px solid $blue;
  }

  .label:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    animation: ellipsis steps(4, end) 1.5s infinite;
    content: '\2026'; /* ascii code for the ellipsis character */
    width: 0;
  }

  &.padded {
    padding: 2rem;
  }

  &.inline {
    display: inline;

    .spinner {
      width: 1rem;
      height: 1rem;
      margin: 0 0 0 0.5rem;
      border-width: 2px;
      vertical-align: top;
    }

    .label {
      display: none;
    }
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

@keyframes ellipsis {
  to {
    width: 20px;
  }
}
</style>
