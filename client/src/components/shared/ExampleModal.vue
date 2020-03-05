<template>
  <div class="modal is-active">
    <div class="modal-background" @click="closeExample"></div>
    <div class="modal-content">
      <button class="button close-btn is-text has-text-grey is-pulled-right" @click="closeExample">
        <span class="fa fa-times"></span>
      </button>
      <slot :close="closeExample" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExampleModal',
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  methods: {
    closeExample() {
      this.handleClose();
    },
  },
};
</script>

<style scoped lang="scss">
.fa {
  font-size: 22px;
}

.modal-content {
  background: white;
  padding: 2em;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 10px;
}
</style>
