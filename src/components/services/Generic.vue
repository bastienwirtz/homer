<template>
  <!-- Takes the `item.class` fallthrough, which themes match as an ancestor. -->
  <div>
    <div class="card-wrapper">
      <div class="card" :style="cardStyle">
        <div
          class="card-content"
          :class="{
            'has-icon': $slots.icon || item.logo || item.icon,
            'has-lane': !!item.quick,
          }"
        >
          <a
            class="card-link"
            :href="item.url"
            :target="item.target"
            :aria-label="item.url ? item.name : null"
            rel="noreferrer"
          ></a>
          <slot name="icon">
            <div v-if="item.icon" class="card-icon">
              <figure class="image">
                <i :class="['fa-fw', item.icon]"></i>
              </figure>
            </div>
            <div v-else-if="item.logo" class="card-icon">
              <figure class="image">
                <img :src="item.logo" :alt="`${item.name} logo`" />
              </figure>
            </div>
          </slot>
          <div class="card-body">
            <p class="title">{{ item.name }}</p>
            <div
              v-if="item.subtitle || $slots.subtitle || subtitle"
              class="subtitle"
            >
              <template v-if="item.subtitle">{{ item.subtitle }}</template>
              <slot v-else name="subtitle">{{ subtitle }}</slot>
            </div>
          </div>
          <div v-if="$slots.badges || visibleBadges.length" class="card-badges">
            <slot name="badges">
              <!-- A link, or it would swallow the card click. -->
              <a
                v-for="badge in visibleBadges"
                :key="badge.key"
                class="badge"
                :class="badge.tone"
                :title="badge.label"
                :href="item.url"
                :target="item.target"
                tabindex="-1"
                rel="noreferrer"
              >
                {{ badge.text }}
              </a>
            </slot>
          </div>
          <div v-if="$slots.aside || status" class="card-aside">
            <slot name="aside">
              <div v-if="status" class="status" :class="status.state">
                {{ status.label }}
              </div>
            </slot>
          </div>
          <div v-if="item.quick || item.tag" class="card-lane">
            <p v-if="item.quick" class="quicklinks">
              <a
                v-for="(link, linkIndex) in item.quick"
                :key="linkIndex"
                :style="link.color ? `background-color:${link.color};` : null"
                :href="link.url"
                :target="link.target"
                rel="noreferrer"
              >
                <span v-if="link.icon"
                  ><i
                    style="font-size: 12px"
                    :class="['fa-fw', link.icon]"
                  ></i></span
                >{{ link.name }}
              </a>
            </p>
            <div v-if="item.tag" class="tag-slot">
              <a
                class="tag"
                :class="item.tagstyle"
                :href="item.url"
                :target="item.target"
                tabindex="-1"
                aria-hidden="true"
                rel="noreferrer"
              >
                <strong class="tag-text">#{{ item.tag }}</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { capCount } from "@/utils/format.js";

const isEmpty = (badge) =>
  badge.value === "" ||
  badge.value === null ||
  badge.value === undefined ||
  (badge.value === 0 && !badge.showZero);

export default {
  name: "Generic",
  props: {
    item: Object,
    subtitle: String,
    status: Object,
    badges: Array,
  },
  computed: {
    cardStyle() {
      return this.item.background
        ? { backgroundColor: this.item.background }
        : null;
    },
    visibleBadges() {
      const hidden = this.item.hide || [];
      return (this.badges ?? [])
        .filter((badge) => !hidden.includes(badge.key) && !isEmpty(badge))
        .map((badge) => ({ ...badge, text: capCount(badge.value) }));
    },
  },
};
</script>
