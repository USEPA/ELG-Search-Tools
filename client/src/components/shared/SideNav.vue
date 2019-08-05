<template>
  <div class="modal is-active">
    <div class="modal-background" @click="close"></div>
    <div :class="`modal-content ${this.shouldDismiss ? 'dismiss' : ''}`">
      <span class="title is-size-4">{{ title }}</span>
      <button type="button" class="button is-text has-text-white is-pulled-right" @click="close">
        <span class="fa fa-times"></span>
      </button>
      <hr />
      <!-- give slots access to the close function outside of this component -->
      <slot :close="close" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideNav',
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
    handleShown: {
      type: Function,
      required: false,
      default: () => {},
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      shouldDismiss: false,
    };
  },
  mounted() {
    this.handleShown();
  },
  methods: {
    close() {
      this.shouldDismiss = true;
      // delay 500ms for slide animation to complete
      setTimeout(() => this.handleClose(), 500);
    },
  },
};
</script>

<style scoped lang="scss">
.modal {
  z-index: 999;
}

.modal-background {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-content {
  position: fixed;
  padding: 1em;
  width: 30rem;
  right: 0;
  top: 0;
  border-radius: 0;
  max-height: 100%;
  height: 100%;
  background-color: #162a49;
  color: white !important;

  animation: slide-in 0.5s forwards;

  &.dismiss {
    animation: slide-out 0.5s forwards;
  }
}

@keyframes slide-in {
  0% {
    -webkit-transform: translateX(100%);
  }
  100% {
    -webkit-transform: translateX(0%);
  }
}

@keyframes slide-out {
  0% {
    -webkit-transform: translateX(0%);
  }
  100% {
    -webkit-transform: translateX(100%);
  }
}

.close {
  color: white !important;
}
</style>

<style lang="scss">
.button.is-text:hover {
  background: none;
}
</style>
