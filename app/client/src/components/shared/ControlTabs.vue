<template>
  <section>
    <div class="grid-row control-tabs-container">
      <div class="grid-col-6">
        <p>Direct Discharge Requirements</p>
        <div class="is-divider direct"></div>
        <ul class="grid-row tabs aq-tabs">
          <li
            v-for="(tab, index) in directTabs"
            :key="tab"
            :class="`grid-col ${tab === activeTab || (!activeTab && index === 0) ? 'is-active' : ''}`"
          >
            <button :title="acronyms[tab]" @click="$emit('onTabClick', tab)">{{ tab }}</button>
          </li>
        </ul>
      </div>
      <div class="grid-col-3">
        <p>Indirect Discharge Requirements</p>
        <div class="is-divider indirect"></div>
        <ul class="grid-row tabs aq-tabs">
          <li v-for="tab in indirectTabs" :key="tab" :class="`grid-col ${tab === activeTab ? 'is-active' : ''}`">
            <button
              :class="tab === activeTab ? 'is-active' : ''"
              :title="acronyms[tab]"
              @click="$emit('onTabClick', tab)"
            >
              {{ tab }}
            </button>
          </li>
        </ul>
      </div>
      <div class="grid-col-3 tabs aq-tabs"></div>
    </div>
    <slot :name="activeTab ? activeTab : tabs[0]" />
  </section>
</template>

<script>
export default {
  props: {
    activeTab: {
      type: String,
    },
  },
  data() {
    return {
      tabs: ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'],
      acronyms: {
        BPT: 'Best Practicable Control Technology Currently Available',
        BAT: 'Best Available Technology Economically Achievable',
        BCT: 'Best Conventional Pollutant Control Technology',
        NSPS: 'New Source Performance Standards',
        PSES: 'Pretreatment Standards for Existing Sources',
        PSNS: 'Pretreatment Standards for New Sources',
      },
    };
  },
  computed: {
    directTabs() {
      return this.tabs.slice(0, 4);
    },
    indirectTabs() {
      return this.tabs.slice(4, 6);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.control-tabs-container {
  border-bottom: 2px solid $blue;
  margin-bottom: 0.75rem;

  &.columns {
    margin-left: 0;
    margin-right: 0;
  }
  .column {
    padding: 0;
  }

  p {
    font-size: 0.95rem;
    margin-bottom: 0;
    padding-bottom: 0;
    text-align: center;
  }
}

.tabs.aq-tabs {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    min-width: 100px;
    margin: 0;
    padding-right: 0.2rem;

    button {
      font-weight: bold;
      background-color: $gray;
      color: #212121;
      justify-content: center;
      margin-right: 0.2rem;
      margin-bottom: 0;
      padding: 0.6rem 1.5rem;
      width: 100%;
      border: none;
      border-radius: 0;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      white-space: inherit;
      line-height: inherit;
      cursor: pointer;

      &:hover {
        background-color: darken($gray, 10);
      }
    }

    &.is-active button {
      background-color: $blue;
      color: #fff;

      &:hover {
        cursor: default;
      }
    }
  }
}

.is-divider {
  margin: 0 0.1rem 0.2rem 0;
  border: 2px solid;

  &.direct {
    border-color: #93b4ca;
  }

  &.indirect {
    border-color: #b7cfa2;
  }
}

.direct-discharge-container,
.indirect-discharge-container {
  p {
    font-size: 15px;
    padding: 0;
    text-align: center;
  }
}
</style>
