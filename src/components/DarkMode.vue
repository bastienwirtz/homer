<template>
  <a
    class="navbar-item is-inline-block-mobile darkmode-toggle"
    aria-label="Toggle dark mode"
    @click="toggleTheme"
    :title="titles[mode]"
    role="button"
  >
    <i :class="faClasses[mode]" class="fa-fw" aria-hidden="true"></i>
    <span class="sr-only">{{ titles[mode] }}</span>
  </a>
</template>

<script>
export default {
  name: 'Darkmode',
  props: {
    defaultValue: {
      type: String,
      default: 'auto', // 'auto', 'light', 'dark'
      validator: (value) => ['auto', 'light', 'dark'].includes(value),
    },
  },
  emits: ['updated'],
  data() {
    return {
      mode: 0, // 0: auto, 1: light, 2: dark
      faClasses: [
        'fas fa-adjust',
        'fas fa-sun',
        'fas fa-moon', // Changed to sun and moon
      ],
      titles: ['Auto-switch', 'Light theme', 'Dark theme'],
    };
  },
  mounted() {
    this.loadThemePreference();
    this.updateTheme();
    this.setupMediaQueryListener();
  },
  beforeUnmount() {
    this.removeMediaQueryListener();
  },
  methods: {
    loadThemePreference() {
      try {
        const storedMode = localStorage.getItem('overrideDark');
        if (storedMode) {
          this.mode = JSON.parse(storedMode) ? 2 : 1;
        } else {
          switch (this.defaultValue) {
            case 'light':
              this.mode = 1;
              break;
            case 'dark':
              this.mode = 2;
              break;
            default:
              this.mode = 0;
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to default
        this.mode = 0;
      }
    },
    saveThemePreference() {
      try {
        if (this.mode === 0) {
          localStorage.removeItem('overrideDark');
        } else {
          localStorage.setItem('overrideDark', JSON.stringify(this.mode === 2));
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    },
    toggleTheme() {
      this.mode = (this.mode + 1) % 3;
      this.saveThemePreference();
      this.updateTheme();
    },
    updateTheme() {
      const isDark = this.getIsDark();
      this.$emit('updated', isDark);
    },
    getIsDark() {
      if (this.mode === 0) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return this.mode === 2;
    },
    setupMediaQueryListener() {
      this.mediaQueryListener = (event) => {
        if (this.mode === 0) {
          // Auto mode: update when system preference changes
          this.updateTheme();
        }
      };

      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', this.mediaQueryListener);
    },
    removeMediaQueryListener() {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', this.mediaQueryListener);
    },
  },
};
</script>

<style scoped>
/* Add some basic styling for better appearance */
.darkmode-toggle {
  cursor: pointer;
}
</style>
