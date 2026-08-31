<template>
  <span
    ref="trigger"
    class="hover-info-container"
    tabindex="0"
    @mouseenter="show"
    @mouseleave="scheduleHide"
    @focus="show"
    @blur="scheduleHide"
    @keyup.esc="hide"
  >
    <span v-if="!icon" class="hover-link" :aria-describedby="hoverId">{{ linkText }}</span>
    <i v-if="icon" class="fa fa-info-circle" :aria-describedby="hoverId"></i>
    <Teleport to="body">
      <span
        v-if="isVisible"
        ref="tooltip"
        class="hover-info"
        role="tooltip"
        :id="hoverId"
        :style="[customStyle, positionStyle]"
        @mouseenter="show"
        @mouseleave="scheduleHide"
        @focusin="show"
        @focusout="scheduleHide"
      >
        <slot />
      </span>
    </Teleport>
  </span>
</template>

<script>
// Distance kept between the tooltip and the edge of the viewport
const VIEWPORT_MARGIN = 8;
// Preserves the horizontal offset the tooltip had when it was absolutely positioned
const TRIGGER_OFFSET = 68;
// Grace period so the pointer can travel from the trigger onto the tooltip
const HIDE_DELAY = 150;

export default {
  props: {
    hoverId: String.required,
    icon: Boolean,
    linkText: String,
    customStyle: Object,
  },
  data() {
    return {
      isVisible: false,
      // Hidden until measured so the tooltip never flashes at the top left of the page
      positionStyle: { visibility: 'hidden' },
      hideTimer: null,
      isRepositionQueued: false,
    };
  },
  methods: {
    show() {
      clearTimeout(this.hideTimer);
      if (this.isVisible) {
        return;
      }
      this.isVisible = true;
      // The tooltip has to be in the DOM before it can be measured
      this.$nextTick(this.position);
      // Capture phase so the table's own scroll container is heard, not just the window
      window.addEventListener('scroll', this.queueReposition, true);
      window.addEventListener('resize', this.queueReposition);
    },
    scheduleHide() {
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(this.hide, HIDE_DELAY);
    },
    hide() {
      clearTimeout(this.hideTimer);
      window.removeEventListener('scroll', this.queueReposition, true);
      window.removeEventListener('resize', this.queueReposition);
      this.isVisible = false;
      this.positionStyle = { visibility: 'hidden' };
    },
    queueReposition() {
      if (this.isRepositionQueued) {
        return;
      }
      this.isRepositionQueued = true;
      requestAnimationFrame(() => {
        this.isRepositionQueued = false;
        this.position();
      });
    },
    position() {
      const { trigger, tooltip } = this.$refs;
      if (!trigger || !tooltip) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      // The trigger can be scrolled out of its table while the tooltip is open
      if (triggerRect.bottom < 0 || triggerRect.top > window.innerHeight) {
        this.hide();
        return;
      }

      // Prefer above the trigger, drop below when there is not enough room
      const fitsAbove = triggerRect.top - tooltipRect.height >= VIEWPORT_MARGIN;
      const top = fitsAbove ? triggerRect.top - tooltipRect.height : triggerRect.bottom;

      const maxLeft = Math.max(window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN, VIEWPORT_MARGIN);
      const left = Math.min(Math.max(triggerRect.left - TRIGGER_OFFSET, VIEWPORT_MARGIN), maxLeft);

      this.positionStyle = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        // Copies the trigger's alignment, since the tooltip now inherits from <body> instead of its cell
        textAlign: window.getComputedStyle(trigger).textAlign,
        visibility: 'visible',
      };
    },
  },
  beforeUnmount() {
    this.hide();
  },
};
</script>

<style lang="scss">
.hover-info-container {
  position: relative;
  cursor: pointer;

  .hover-link {
    border-bottom: 1px dashed #999;
  }

  &:focus {
    outline: 2px dotted #aeb0b5;
    outline-offset: 2px;
  }

  .fa-info-circle {
    color: #0071bc;
  }
}

// Teleported to the end of <body>, so this cannot be nested under the container above.
// Fixed positioning is what keeps it clear of the scrolling table container's overflow clip.
.hover-info {
  // Positioning
  position: fixed;
  font-weight: normal;

  // Box-model
  width: 350px;
  padding: 15px;

  // Typography
  font-size: 0.9rem;
  font-family: 'Source Sans Pro', sans-serif;

  // Visual
  background-color: #fff;
  opacity: 0.99;
  color: #000;
  box-shadow:
    0 10px 16px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);

  // Misc
  z-index: 999;
}
</style>
