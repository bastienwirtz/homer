<template>
  <div v-if="links" class="navbar-container">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="menu"
          aria-expanded="false"
          @click="toggleNavbar"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarBasicExample"
        class="navbar-menu"
        :class="{ 'is-active': isMenuOpen }"
      >
        <div class="navbar-start">
          <a
            v-for="link in links"
            :key="link.name"
            class="navbar-item"
            :href="link.url"
            :target="link.target"
            rel="noopener noreferrer"
          >
            <i v-if="link.icon" :class="['fa-fw', link.icon]"></i>
            {{ link.name }}
          </a>
        </div>

        <div class="navbar-end">
          <slot></slot>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    links: {
      type: Array,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['navbar-toggle'],
  data() {
    return {
      isMenuOpen: false,
    };
  },
  watch: {
    open(newOpen) {
      // keep internal state synced with prop, but only on larger screens
      if (!this.isSmallScreen()) {
        this.isMenuOpen = newOpen;
      }
    },
  },
  mounted() {
    // init state based on prop
    this.isMenuOpen = this.open;
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    toggleNavbar() {
      this.isMenuOpen = !this.isMenuOpen;
      this.$emit('navbar-toggle');
    },
    isSmallScreen() {
      return window.innerWidth < 1024;
    },
    handleResize() {
      // close menu if screen becomes larger than small screen breakpoint
      if (!this.isSmallScreen() && this.isMenuOpen) {
        this.isMenuOpen = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
}

.navbar {
  background-color: #f8f9fa; /* Example background color */
  padding: 0.5rem 1rem;

  .navbar-brand {
    .navbar-item {
      font-weight: bold;
    }
  }

  .navbar-menu {
    .navbar-item {
      color: #333;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}

i.fa-fw {
  width: 0.8em;
  text-align: center;
  margin-right: 0.2em;
}

@media screen and (max-width: 1023px) {
  .navbar-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    z-index: 10;
  }
}
</style>
