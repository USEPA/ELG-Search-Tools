<template>
  <div class="usa-modal-wrapper" @click="$emit('close')">
    <div class="usa-modal-overlay" @keyup.esc="$emit('close')">
      <div class="usa-modal" @click.stop>
        <h2 :class="title ? 'usa-modal__heading' : ''">{{ title }}</h2>
        <button class="usa-button usa-modal__close" aria-label="close" @click="$emit('close')">
          <span class="fa fa-times"></span>
        </button>
        <div class="usa-modal__content">
          <slot />
        </div>
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
  data() {
    return {
      focusableEls: [],
    };
  },
  methods: {
    // Implement "focus trap" - force focus to remain inside modal to ensure accessibility
    handleFocus(e) {
      // Close modal on Escape keypress
      if (e.key === 'Escape' && typeof this.closeFnc === 'function') {
        this.closeFnc();
      }

      if (
        (e.target === this.focusableEls[this.focusableEls.length - 1] && e.key === 'Tab' && !e.shiftKey) ||
        (e.key === 'Tab' && this.focusableEls.indexOf(e.target) === -1)
      ) {
        e.preventDefault();
        this.focusableEls[0].focus();
      } else if (e.target === this.focusableEls[0] && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        this.focusableEls[this.focusableEls.length - 1].focus();
      }
    },
  },
  mounted() {
    // Get focusable elements within modal content, then push the modal close button to the end
    this.focusableEls = Array.from(
      document.querySelector('.usa-modal').querySelectorAll('input, button, select, textarea, [href]')
    );
    this.focusableEls.push(document.querySelector('.usa-modal__close'));

    // Set custom tab indices so that the close button is focused last, after modal content inputs
    this.focusableEls.forEach((el, index) => {
      el.tabIndex = index + 1; // eslint-disable-line no-param-reassign
    });
    this.focusableEls[0].focus();

    // Add event listener for accessible focus
    document.addEventListener('keydown', this.handleFocus);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleFocus);
  },
};
</script>

<style lang="scss" scoped>
.usa-modal {
  max-width: 640px;
}
.usa-modal-wrapper {
  visibility: visible;
  opacity: 1;
  position: fixed;
  z-index: 99999;
}
.usa-modal__heading {
  padding: 1rem;
  margin: 0;
  background-color: #f1f1f1;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.usa-modal__content {
  padding: 1rem;
}
.usa-modal__close {
  font-size: 1.2rem;
  position: absolute;
  right: 1rem;
  top: 3rem;

  .fa {
    color: #0a0a0a80;
    margin-right: 0;

    &:hover {
      color: #1b1b1b;
    }
  }
}
</style>
