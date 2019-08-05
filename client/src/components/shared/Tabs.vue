<template>
  <section class="is-12 aq-tabs-container">
    <div class="tabs aq-tabs is-boxed">
      <ul>
        <li v-for="tab in tabs" :key="tab.id" :class="tab.id === activeTabId ? 'is-active' : ''">
          <a @click="activeTabId = tab.id">{{ tab.name }}</a>
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
      border-bottom: 8px solid $lightBlue;

      li {
        min-width: 5em;

        a {
          border: none;
          color: #fff;
          background-color: $darkBlue;
          margin-right: 0.2em;
          margin-bottom: 0;

          &:hover {
            background-color: darken($darkBlue, 10);
          }
        }

        &.is-active a {
          background-color: $lightBlue;
          font-weight: bold;

          &:hover {
            cursor: default;
          }
        }
      }
    }
  }
}
</style>
