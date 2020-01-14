<template>
  <section class="is-12 aq-tabs-container">
    <div class="columns label-container">
      <div class="column direct-discharge-container is-3">
        <p class="has-text-black">Direct Discharge Requirements</p>
        <div class="is-divider direct"></div>
      </div>
      <div class="column indirect-discharge-container is-3">
        <p class="has-text-black">Indirect Discharge Requirements</p>
        <div class="is-divider indirect"></div>
      </div>
    </div>
    <div class="tabs aq-tabs is-toggle">
      <ul>
        <li v-for="tab in tabs" :key="tab.id" :class="tab.id === activeTabId ? 'is-active' : ''">
          <button @click="activeTabId = tab.id">{{ tab.name }}</button>
        </li>
      </ul>
    </div>
    <slot :name="activeTabId" />
  </section>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activeTabId: this.tabs.find((t) => t.isActive) ? this.tabs.find((t) => t.isActive).id : this.tabs[0].id,
    };
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
          width: 117px;

          &:hover {
            background-color: darken($lightBlue, 10);
          }
        }

        &.is-active button {
          background-color: #d6e3eb;
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
  padding-bottom: 0;
  padding-right: 0;
  padding-left: 0;
  p {
    font-size: 15px;
    margin-bottom: 2px;
    text-align: center;
    padding-bottom: 0;
  }
}

.direct-discharge-container {
  padding-left: 0;
}

.indirect-discharge-container {
  margin-left: 4px;
}

ul {
  padding-left: 0 !important;
}
</style>
