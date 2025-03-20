<template>
  <a
    class="navbar-item is-inline-block-mobile setting-toggle"
    @click.prevent="toggleSetting"
    role="button"
    :aria-pressed="value"
    :title="name"
  >
    <span><i :class="['fas', 'fa-fw', value ? icon : secondaryIcon]"></i></span>
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: 'SettingToggle',
  props: {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    iconAlt: {
      type: String,
      default: null,
    },
    defaultValue: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['updated'],
  data() {
    return {
      value: this.defaultValue, // Initialize with defaultValue
    };
  },
  computed: {
    secondaryIcon() {
      return this.iconAlt || this.icon;
    },
  },
  mounted() {
    this.loadSetting();
  },
  methods: {
    loadSetting() {
      try {
        const storedValue = localStorage.getItem(this.name);
        if (storedValue !== null) {
          this.value = JSON.parse(storedValue);
        } else {
          this.value = this.defaultValue;
        }
      } catch (error) {
        console.error(`Error loading setting ${this.name} from localStorage:`, error);
        // Fallback to default value in case of error
        this.value = this.defaultValue;
      }
      this.$emit('updated', this.value);
    },
    toggleSetting() {
      this.value = !this.value;
      try {
        localStorage.setItem(this.name, JSON.stringify(this.value));
      } catch (error) {
        console.error(`Error saving setting ${this.name} to localStorage:`, error);
      }
      this.$emit('updated', this.value);
    },
  },
};
</script>

<style scoped>
.setting-toggle {
  cursor: pointer;
}
</style>
