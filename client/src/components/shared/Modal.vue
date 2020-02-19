<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-content" @keydown.native.esc="close" role="dialog" aria-modal="true">
      <div class="box">
        <button type="button" class="button is-text modal" @click="$emit('close')" aria-label="Close">
          <span class="fa fa-times"></span>
        </button>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  z-index: 9999;
}

.button.is-text.modal {
  display: block;
  margin: 0 0 0 auto;
  padding: 0;
  height: 1em;
  position: relative;
}
</style>
