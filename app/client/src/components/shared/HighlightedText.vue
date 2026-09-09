<template>
  <span
    ><component
      :is="part.isMatch ? 'mark' : 'span'"
      v-for="(part, index) in parts"
      :key="index"
      :class="part.isMatch ? 'keyword-highlight' : null"
      >{{ part.text }}</component
    ></span
  >
</template>

<script>
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Splits text into alternating plain/matched segments so each segment can be rendered as a text node.
// Interpolating the segments avoids v-html, so the source text is still escaped by Vue.
export function splitOnKeywords(text, keywords) {
  const source = String(text ?? '');
  // De-dupe, then longest first so overlapping terms match the fuller phrase
  const terms = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);

  if (!terms.length || !source) {
    return [{ text: source, isMatch: false }];
  }

  // Keywords are free text, so they have to be escaped before going into the pattern
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');

  // A split() on a pattern with one capture group interleaves: [plain, match, plain, match, ...],
  // so map before filtering to keep the index parity that identifies matches
  return source
    .split(pattern)
    .map((part, index) => ({ text: part, isMatch: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}

export default {
  name: 'HighlightedText',
  props: {
    text: {
      type: String,
      required: false,
      default: '',
    },
    keywords: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  computed: {
    parts() {
      return splitOnKeywords(this.text, this.keywords);
    },
  },
};
</script>

<style scoped lang="scss">
mark.keyword-highlight {
  background-color: #faf3d1;
  color: inherit;
  padding: 0 1px;
}
</style>
