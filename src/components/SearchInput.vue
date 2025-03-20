<template>
  <div class="search-bar">
    <form role="search" @submit.prevent="open()">
      <label for="search-input" class="search-label sr-only">Search</label>
      <input
        id="search-input"
        ref="searchInput"
        name="search"
        type="search"
        class="search-input"
        :value="value"
        @input="handleInput($event.target.value)"
        @keydown.esc="cancelSearch"
      />
      <button type="submit" class="search-button">
        <i class="fa fa-search"></i>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: '',
    },
    hotkey: {
      type: String,
      default: '/',
    },
  },
  emits: ['search-open', 'search-focus', 'search-cancel', 'update:value'],
  data() {
    return {
      isFocused: false,
    };
  },
  mounted() {
    this.setupKeyListener();
    this.initializeSearchFromURL();
  },
  beforeUnmount() {
    this.removeKeyListener();
  },
  methods: {
    setupKeyListener() {
      this._keyListener = (event) => {
        if (!this.isFocused && event.key === this.hotkey) {
          event.preventDefault();
          this.focusSearchInput();
        } else if (event.key === 'Escape') {
          this.cancelSearch();
        }
      };
      document.addEventListener('keydown', this._keyListener);
    },
    removeKeyListener() {
      document.removeEventListener('keydown', this._keyListener);
    },
    initializeSearchFromURL() {
      const search = new URLSearchParams(window.location.search).get('search');
      if (search) {
        this.handleInput(search);
        this.focusSearchInput();
      }
    },
    open(target = null) {
      if (!this.value) {
        return;
      }
      this.$emit('search-open', target);
    },
    focusSearchInput() {
      this.isFocused = true;
      this.$emit('search-focus');
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    cancelSearch() {
      this.updateSearchURL('');
      this.handleInput('');
      this.isFocused = false;
      this.$refs.searchInput.blur();
      this.$emit('search-cancel');
    },
    handleInput(newValue) {
      this.updateSearchURL(newValue);
      this.$emit('update:value', newValue);
    },
    updateSearchURL(value) {
      const url = new URL(window.location);
      if (value === '') {
        url.searchParams.delete('search');
      } else {
        url.searchParams.set('search', value);
      }
      window.history.replaceState('search', null, url);
    },
  },
};
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  justify-content: center;
  padding: 1rem;

  .search-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .search-input {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 300px;
    font-size: 1rem;
  }

  .search-button {
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 1rem;
    margin-left: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
