<template>
  <div class="column is-one-third">
    <input
      class="is-checkradio is-block is-info"
      :id="id"
      :type="isSingleSelect ? 'radio' : 'checkbox'"
      :name="isSingleSelect ? singleSelectId : name"
      @change="$emit('check', $event)"
      :value="value"
      :checked="checked"
      :disabled="disabled"
    />
    <label :id="id" :for="id">{{ name }}</label>
  </div>
</template>

<script>
export default {
  name: 'CheckboxButton',
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isSingleSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    singleSelectId: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: false,
    },
    checked: {
      type: Boolean,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import '../../../static/variables';

.column {
  min-height: 90px;
  display: flex;

  & > .is-checkradio.is-block + label {
    min-height: 90px;
    background-color: $darkBlue;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 10px;
    color: white;
    text-align: center;

    &:hover {
      background-color: darken($darkBlue, 5);
    }
  }

  & > .is-checkradio.is-block[type='radio'] + label {
    &::before,
    &::after {
      top: 0.2em;
      left: 0.2em;
    }
  }

  & > .is-checkradio.is-info.is-block:checked + label {
    background-color: $green;

    &:hover {
      background-color: darken($green, 5);
    }
  }

  & > .is-checkradio + label {
    margin: 0;
  }
}
</style>
