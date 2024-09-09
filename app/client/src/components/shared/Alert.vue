<template>
  <div :class="`message ${getClass()} ${isSlim ? 'slim' : ''}`">
    <div class="message-body">
      <span :class="'fa is-size-3 ' + getIcon()"></span>
      <span v-if="isMessageHTML" class="alert-message has-text-weight-semibold" :is="contentComp"></span>
      <span v-else-if="!message" class="alert-message"><slot /></span>
      <span v-else class="alert-message has-text-weight-semibold">{{ message }}</span>
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
    isMessageHTML: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSlim: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    contentComp() {
      return { template: `<p>${this.message}</p>` };
    },
  },
  methods: {
    getIcon() {
      switch (this.type) {
        case 'error':
          return 'fa-exclamation-circle';
        case 'warning':
          return 'fa-exclamation-triangle';
        case 'info':
          return 'fa-info-circle';
        default:
        case 'success':
          return 'fa-check-circle';
      }
    },
    getClass() {
      switch (this.type) {
        case 'error':
          return 'is-danger';
        case 'warning':
          return 'is-warning';
        case 'info':
          return 'is-primary';
        default:
        case 'success':
          return 'is-success';
      }
    },
  },
};
</script>

<style scoped lang="scss">
.fa {
  margin: auto 0.5em auto 0;
}

.message {
  & > .message-body {
    color: #212121;
  }

  &.is-danger {
    background-color: #f9dede;
  }

  &.is-success {
    background-color: #e7f4e4;
  }

  &.is-warning {
    background-color: #fff1d2;
  }

  &.is-info {
    background-color: #e7f6f8;
  }

  .message-body {
    display: flex;
    border-left-width: 0.5em;
    padding: 1em;

    .alert-message {
      margin: auto 0;
    }
  }

  &.slim {
    display: inline-block;
    margin-bottom: 0.75rem;

    .message-body {
      padding: 0.5rem 0.75rem;
      font-size: 0.95rem;
    }

    .fa {
      font-size: 1.25rem !important;
    }
  }
}
</style>
