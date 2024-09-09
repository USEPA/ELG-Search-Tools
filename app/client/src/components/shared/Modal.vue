<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" @keydown.esc="$emit('close')" role="dialog" aria-modal="true" tabindex="0">
      <header :class="`modal-card-head ${title ? '' : 'no-title'}`">
        <p class="modal-card-title">{{ title }}</p>
        <button class="delete is-small" aria-label="close" @click="$emit('close')"></button>
      </header>
      <div class="modal-card-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      required: false,
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  z-index: 9999;
}

.modal-background {
  background-color: rgba(10, 10, 10, 0.25);
}

.modal-card {
  border-radius: 6px;
}

.modal-card-head {
  padding: 1rem;

  &.no-title {
    background-color: #fff;
    border: none;
    height: 0;
    padding: 0;

    .delete {
      margin-top: 2rem;
      margin-right: 0.5rem;
    }
  }
}

.modal-card-title {
  padding-bottom: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.delete {
  background-color: rgba(10, 10, 10, 0.5);

  &:hover {
    background-color: rgba(10, 10, 10, 0.3);
  }
}

.button.is-text.modal {
  display: block;
  margin: 0 0 0 auto;
  padding: 0;
  height: 1em;
  position: relative;
}
</style>
