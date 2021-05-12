<template>
  <div id="glossary" class="glossary" aria-describedby="glossary-title" aria-hidden="true">
    <header class="glossary-header">
      <h2 id="glossary-title" class="glossary-title">Glossary</h2>
      <button class="js-glossary-close" title="Close glossary" tabindex="0">×</button>
    </header>
    <div class="glossary-content">
      <Alert v-if="shouldDisplayError" type="error">Failed to fetch Glossary items.</Alert>
      <div v-else-if="isFetchingTerms" style="text-align:center">
        Fetching glossary terms...
        <LoadingIndicator />
      </div>
      <input
        v-show="!shouldDisplayError && !isFetchingTerms"
        class="js-glossary-search form-control"
        type="search"
        placeholder="Search for a term..."
        aria-label="Search for a glossary term..."
      />
      <ul class="js-glossary-list"></ul>
    </div>
  </div>
</template>

<script>
import Glossary from 'glossary-panel';

export default {
  data() {
    return {
      isFetchingTerms: false,
      shouldDisplayError: false,
    };
  },
  mounted() {
    this.isFetchingTerms = true;
    this.$http
      .get('api/glossary')
      .then((response) => {
        let terms = response.data
          .filter((item) => item.ActiveStatus !== 'Deleted')
          .map((item) => {
            const term = item.Name;
            // Check Editorial Note field first if definition requires html markup
            const editorialNote = item.Attributes.find((attr) => attr.Name === 'EditorialNote');
            const term1 = item.Attributes.find((attr) => attr.Name === 'Def1');
            const definition = editorialNote ? editorialNote.Value : term1.Value;
            return { term, definition };
          });

        // filter out duplicate terms from the web service
        terms = terms
          .filter((item, index) => terms.findIndex((term) => term.term === item.term) === index)
          .map((termObject) => {
            return {
              term: termObject.term.replace('>', '&gt;').replace('<', '&lt;'),
              definition: termObject.definition,
            };
          });

        this.isFetchingTerms = false;

        // initialize Glossary component with fetched terms
        new Glossary(terms); // eslint-disable-line
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line
        this.shouldDisplayError = true;
        this.isFetchingTerms = false;
      });
  },
};
</script>

<style lang="scss" scoped>
.glossary {
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  overflow-y: auto;
  width: 22rem;
  height: 100%;
  background-color: white;
  box-shadow: -0.375em -0.375em 0.625em -0.375em rgba(0, 0, 0, 0.25);
  transition: right 0.2s;

  @media (max-width: 400px) {
    width: 85%;
  }

  &[aria-hidden='true'] {
    right: -22.375rem;
  }
}

.glossary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0071bc;
}

.glossary-title {
  margin-left: 0.75rem;
  margin-bottom: 0.125rem;
  padding-bottom: 0px;
  font-size: 1.25em;
  color: white;
}

.glossary-content {
  padding: 0.75rem;

  p {
    line-height: 1.375;
  }
}

.js-glossary-list {
  margin-top: 0.375rem;
  padding: 0;
  list-style: none;

  ::v-deep .glossary__term {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.375rem;
    margin-bottom: 0;
    padding: 0.5rem;
    border: 1px solid transparent;
    border-radius: 0;
    width: 100%;
    font-size: 0.9375rem;
    font-weight: normal;
    text-align: left;
    color: #0071bc;
    background-color: transparent;

    &:hover,
    &:focus {
      text-decoration: underline;
    }

    &::after {
      content: '\f0da';
      margin-left: 0.5rem;
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
    }

    &[aria-expanded='true'] {
      border-color: rgba(0, 0, 0, 0.375);
      text-decoration: none;
      color: #444;
      background-color: #f0f6f9;

      &::after {
        content: '\f0d7';
      }
    }
  }

  ::v-deep .glossary__definition {
    padding: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.375);
    border-top: none;

    h3 {
      margin-bottom: 0;
      padding-bottom: 0.375rem;
      font-size: 1.0625rem;
    }

    p {
      padding-bottom: 0.75rem;
      font-size: 0.875rem;

      :last-of-type {
        padding-bottom: 0;
      }
    }
  }
}

.js-glossary-close {
  margin: 0px;
  padding: 0px;
  border: none;
  border-radius: 0px;
  width: 2em;
  height: 2em;
  font-size: 1.125em;
  background-color: rgba(0, 0, 0, 0.25);

  &:hover,
  &:focus {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.js-glossary-search {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 0.9375em;
}
</style>
