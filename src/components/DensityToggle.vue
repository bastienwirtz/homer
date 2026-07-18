<template>
  <a
    class="navbar-item is-inline-block-mobile"
    @click.prevent="cycleDensity()"
    :title="densityLabel"
  >
    <span>
      <i :class="['fas', 'fa-fw', densityIcon]"></i>
    </span>
  </a>
</template>

<script>
export default {
  name: "DensityToggle",
  props: {
    name: {
      type: String,
      default: "density",
    },
    defaultValue: {
      type: String,
      default: "normal",
      validator: (value) => ["normal", "compact", "ultracompact"].includes(value),
    },
  },
  emits: ["updated"],
  data() {
    return {
      densities: ["normal", "compact", "ultracompact"],
      currentDensity: "normal",
      icons: {
        normal: "fa-th-large",
        compact: "fa-th",
        ultracompact: "fa-bars",
      },
      labels: {
        normal: "Normal density",
        compact: "Compact density",
        ultracompact: "Ultra compact density",
      },
    };
  },
  computed: {
    densityIcon() {
      return this.icons[this.currentDensity] || "fa-th-large";
    },
    densityLabel() {
      return this.labels[this.currentDensity] || "Normal density";
    },
  },
  created() {
    this.initializeDensity();
  },
  mounted() {
    this.applyDensity(this.currentDensity);
  },
  methods: {
    initializeDensity() {
      let density = this.defaultValue;

      // Priority: localStorage > defaultValue (from config.yml)
      if (this.name && localStorage[this.name]) {
        const stored = localStorage[this.name];
        if (this.densities.includes(stored)) {
          density = stored;
        }
      }

      this.currentDensity = density;
      console.log(`[DensityToggle] Initialized with: ${this.currentDensity}`);
    },
    applyDensity(density) {
      document.documentElement.setAttribute("data-density", density);
      this.$emit("updated", density);
    },
    cycleDensity() {
      const currentIndex = this.densities.indexOf(this.currentDensity);
      const nextIndex = (currentIndex + 1) % this.densities.length;
      const newDensity = this.densities[nextIndex];

      this.currentDensity = newDensity;

      if (this.name) {
        localStorage[this.name] = newDensity;
      }

      this.applyDensity(newDensity);
    },
  },
};
</script>