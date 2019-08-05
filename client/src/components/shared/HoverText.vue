<template>
  <span class="hover-info-container" tabindex="0" @keyup.esc="blur">
    <span v-if="!icon" class="hover-link" :aria-describedby="hoverId">{{ linkText }}</span>
    <i v-if="icon" class="fa fa-info-circle" :aria-describedby="hoverId"></i>
    <span class="hover-info" role="tooltip" :id="hoverId" :style="customStyle">
      <slot />
    </span>
  </span>
</template>

<script>
export default {
  props: {
    hoverId: String.required,
    icon: Boolean,
    linkText: String,
    customStyle: Object,
  },
  methods: {
    blur(e) {
      e.target.querySelector('.hover-info').style.visibility = 'hidden';
    },
  },
};
</script>

<style lang="scss">
.hover-info-container {
  position: relative;
  cursor: pointer;
  text-align: left;

  .hover-link {
    border-bottom: 1px dashed #999;
  }

  .hover-info {
    //  Positioning
    position: absolute;
    bottom: 100%;
    left: 0;
    font-weight: normal;

    //  Box-model
    width: 465px;
    padding: 15px;
    margin-left: -68px;

    //  Typography
    font-size: 0.9rem;
    font-family: 'Source Sans Pro', sans-serif;

    //  Visual
    visibility: hidden;
    background-color: #fff;
    opacity: 0.99;
    color: #000;
    box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);

    //  Misc
    z-index: 1;

    &::after {
      //  Positioning
      position: absolute;
      top: 100%;
      left: 20%;

      //  Box-model
      margin-left: -5px;

      //  Typography
      border-width: 5px;
      border-style: solid;
      border-color: #fff transparent transparent transparent;

      //  Visual
      //  Misc
      content: ' ';
    }
  }

  &:hover .hover-info,
  &:focus .hover-info {
    visibility: visible;
  }

  &:focus {
    outline: 2px dotted #aeb0b5;
    outline-offset: 2px;
  }
}
</style>
