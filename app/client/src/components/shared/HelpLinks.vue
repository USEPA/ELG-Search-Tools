<template>
  <div class="help-links">
    <a href="#" class="has-text-weight-bold">
      <span class="fas fa-book"></span>
      Glossary
    </a>
    <a href="#" class="has-text-weight-bold">
      <span class="fas fa-question-circle"></span>
      Help
    </a>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.help-links {
  color: $blue;
  margin-top: 0.5rem;
  text-align: right;
  font-size: 0.8rem;

  a:hover,
  a:visited {
    color: $blue;
    text-decoration: underline;
  }

  a:first-child {
    margin-right: 0.5rem;
  }

  .fas {
    font-size: 20px;
    margin-right: 3px;
    vertical-align: bottom;
  }
}
</style>
