<template>
  <Modal @close="$emit('close')">
    <Alert :message="`Are you sure you want to delete ${itemLabel}?`" type="warning" />
    <div class="field is-grouped">
      <div class="control">
        <Button :label="`Delete ${itemLabel}`" type="danger" icon="trash-alt" @click.native="$emit('onDelete')" />
      </div>
    </div>
  </Modal>
</template>

<script>
import Alert from '@/components/shared/Alert';
import Button from '@/components/shared/Button';
import Modal from '@/components/shared/Modal';

export default {
  props: {
    title: {
      type: String,
      required: false,
      default: 'Delete Data',
    },
    itemLabel: {
      type: String,
      required: false,
      default: 'this item',
    },
  },
  components: { Alert, Button, Modal },
};
</script>
