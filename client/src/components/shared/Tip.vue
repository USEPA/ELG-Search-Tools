<template>
  <div class="column is-12">
    <div class="columns">
      <div class="column is-1 tip has-text-centered has-text-weight-bold">Tip</div>
      <div class="column is-11 message">
        <span v-html="message"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tip',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.message {
  background-color: $darkBlue;
}

.tip {
  background-color: $lightBlue;
  color: $darkBlue;
}
</style>
