<template>
  <section class="aq-tabs-container">
    <div class="columns label-container">
      <div class="direct-discharge-container">
        <p>Direct Discharge Requirements</p>
        <div class="is-divider direct"></div>
      </div>
      <div class="indirect-discharge-container">
        <p>Indirect Discharge Requirements</p>
        <div class="is-divider indirect"></div>
      </div>
    </div>
    <div class="tabs aq-tabs is-toggle">
      <ul>
        <li
          v-for="(tab, index) in tabs"
          :key="tab"
          :class="tab === activeTab || (!activeTab && index === 0) ? 'is-active' : ''"
        >
          <button @click="$emit('onTabClick', tab)" :style="tab.indexOf('About') > -1 && { width: '100%' }">
            {{ tab }}
          </button>
        </li>
      </ul>
    </div>
    <slot :name="activeTab ? activeTab : tabs[0]" />
  </section>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.aq-tabs-container {
  clear: both;

  .tabs.aq-tabs {
    margin-bottom: 0;

    ul {
      li {
        min-width: 100px;

        button {
          align-items: center;
          background-color: $gray;
          border: none;
          color: black;
          cursor: pointer;
          display: flex;
          font-size: 1rem;
          height: unset;
          justify-content: center;
          margin-right: 0.2em;
          margin-bottom: 0;
          padding: 0.6em 1.5em;
          vertical-align: top;
          width: 116.5px;
          border-radius: unset;
          white-space: unset;
          line-height: unset;
          &:hover {
            background-color: #d6e3eb;
          }
        }

        &.is-active button {
          background-color: darken($lightBlue, 10);
          font-weight: bold;

          &:hover {
            cursor: default;
          }
        }
      }
    }
  }
}

.is-divider.direct {
  border: solid 2px #93b4ca;
  margin-bottom: 3px;
}

.is-divider.indirect {
  border: solid 2px #b7cfa2;
  margin-bottom: 3px;
}

.label-container {
  margin-bottom: 0 !important;
  padding-left: 12px;
}

.direct-discharge-container,
.indirect-discharge-container {
  p {
    font-size: 15px;
    padding: 0;
    text-align: center;
  }
}

.direct-discharge-container {
  width: 472px;
  padding-right: 1px;
}

.indirect-discharge-container {
  padding-left: 2px;
  width: 237px;
}

ul {
  padding-left: 0 !important;
}
</style>
