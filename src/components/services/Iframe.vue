<template>
  <Generic :item="item" class="h-iframe" :style="{ height: cardHeight }">
    <template #content>
      <div class="h-iframe__wrap" :style="{ height: wrapHeight }">
        <iframe
          :src="item.src || item.url"
          :title="item.name || 'Embed'"
          :loading="item.loading || 'lazy'"
          :referrerpolicy="item.referrerpolicy || 'no-referrer'"
          frameborder="0"
        ></iframe>
      </div>
    </template>
  </Generic>
</template>

<script>
    import Generic from "./Generic.vue";

    export default {
    name: "Iframe",
    components: { Generic },
    props: {
        item: { type: Object, required: true },
        proxy: Object,
    },
    computed: {
        rowUnit() {
        const u = this.item.unit ?? this.item.rowUnit;
        if (typeof u === "number") return `${u}px`;
        if (typeof u === "string" && u.trim()) return u.trim();
        return "85px";
        },

        cardHeight() {
        if (this.item.height) {
            return typeof this.item.height === "number"
            ? `${this.item.height}px`
            : this.item.height;
        }
        const rows = Number(this.item.rows || 2);
        
        return `calc(${rows} * var(--h-row-unit, ${this.rowUnit}))`;
        },

        wrapHeight() {
        const rows = Number(this.item.rows || 2);
        
        return `calc(${rows} * var(--h-row-unit, ${this.rowUnit}))`;
        },
    },
    };
</script>

<style scoped>

    .h-iframe :deep(.card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    }


    .h-iframe :deep(.card-content) {
    height: 100% !important;
    padding: 0 !important;
    display: flex;
    flex: 1 1 auto;
    }


    .h-iframe :deep(.service-content) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    margin: 0 !important;
    flex: 1 1 auto;
    }


    .h-iframe :deep(.service-icon),
    .h-iframe :deep(.service-name),
    .h-iframe :deep(.service-subtitle),
    .h-iframe :deep(.badge),
    .h-iframe :deep(.meta) {
    display: none !important;
    }


    .h-iframe__wrap {
    flex: 1 1 auto;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,.10);
    background: var(--card-background);
    display: flex;
    }

    .h-iframe__wrap iframe {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    border: 0;
    }
</style>
