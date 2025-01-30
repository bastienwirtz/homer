<template>
  <div
    id="app"
    v-if="config"
    :class="[
      'theme-' + config.theme,
      'page-' + currentPage,
      isDark ? 'is-dark' : 'is-light',
      !config.footer ? 'no-footer' : '',
    ]"
  >
    <DynamicTheme :themes="config.colors" />

    <div id="bighead">
      <section v-if="config.header" class="first-line">
        <div v-cloak class="container">
          <div class="logo">
            <a href="#">
              <img
                v-if="config.logo"
                :src="config.logo"
                alt="dashboard logo"
              />
            </a>
            <i v-if="config.icon" :class="config.icon"></i>
          </div>
          <div
            class="dashboard-title"
            :class="{ 'no-logo': !config.icon || !config.logo }"
          >
            <span class="headline">{{ config.subtitle }}</span>
            <h1>{{ config.title }}</h1>
          </div>
        </div>
      </section>

      <Navbar
        :open="showMenu"
        :links="config.links"
        @navbar-toggle="showMenu = !showMenu"
      >
        <DarkMode
          @updated="isDark = $event"
          :defaultValue="config.defaults.colorTheme"
        />

        <SettingToggle
          @updated="vlayout = $event"
          name="vlayout"
          icon="fa-list"
          iconAlt="fa-columns"
          :defaultValue="config.defaults.layout === 'columns'"
        />

        <SearchInput
          class="navbar-item is-inline-block-mobile"
          :hotkey="searchHotkey()"
          @input="filterServices($event)"
          @search-focus="showMenu = true"
          @search-open="navigateToFirstService($event?.target?.value)"
          @search-cancel="resetFilter()"
        />
      </Navbar>
    </div>

    <section id="main-section" class="section">
      <div v-cloak class="container">
        <ConnectivityChecker
          v-if="config.connectivityCheck"
          @network-status-update="offline = $event"
        />

        <GetStarted v-if="configurationNeeded" />

        <div v-if="!offline">
          <Message :item="config.message" />

          <div
            v-if="services.some(g => g.name)"
            class="mb-3"
            style="text-align: right;"
          >
            <button
              class="button is-info is-small"
              @click="toggleAllGroups"
            >
              {{ allCollapsed ? 'Expand All' : 'Collapse All' }}
            </button>
          </div>

          <div v-if="!vlayout || filter" class="columns is-multiline">
            <template v-for="(group, groupIndex) in filteredServices" :key="groupIndex + '-horizontal'">
              <h2 v-if="group.name" class="column is-full group-title">
                <span
                  style="cursor: pointer;"
                  @click="group.collapsed = !group.collapsed"
                >
                  <i
                    :class="[
                      'fa-fw',
                      group.icon ? group.icon : 'fas',
                      group.collapsed ? 'fa-chevron-down' : 'fa-chevron-up',
                    ]"
                    style="margin-right:6px;"
                  ></i>
                </span>

                <i
                  v-if="group.icon && !group.logo"
                  :class="['fa-fw', group.icon]"
                ></i>
                <div
                  v-else-if="group.logo"
                  class="group-logo media-left"
                >
                  <figure class="image is-48x48">
                    <img
                      :src="group.logo"
                      :alt="group.name + ' logo'"
                    />
                  </figure>
                </div>
                {{ group.name }}
              </h2>

              <Service
                v-for="(item, index) in group.items"
                :key="'service-' + groupIndex + '-' + index"
                :item="item"
                :proxy="config.proxy"
                :class="['column', 'is-' + (12 / config.columns)]"
                v-show="!group.collapsed"
              />
            </template>
          </div>

          <div
            v-if="!filter && vlayout"
            class="columns is-multiline layout-vertical"
          >
            <div
              v-for="(group, groupIndex) in filteredServices"
              :key="groupIndex + '-vertical'"
              :class="['column', 'is-' + (12 / config.columns)]"
            >
              <h2 v-if="group.name" class="group-title">
                <span
                  style="cursor: pointer;"
                  @click="group.collapsed = !group.collapsed"
                >
                  <i
                    :class="[
                      'fa-fw',
                      group.icon ? group.icon : 'fas',
                      group.collapsed ? 'fa-chevron-down' : 'fa-chevron-up',
                    ]"
                    style="margin-right:6px;"
                  ></i>
                </span>

                <i
                  v-if="group.icon && !group.logo"
                  :class="['fa-fw', group.icon]"
                ></i>
                <div
                  v-else-if="group.logo"
                  class="group-logo media-left"
                >
                  <figure class="image is-48x48">
                    <img
                      :src="group.logo"
                      :alt="group.name + ' logo'"
                    />
                  </figure>
                </div>
                {{ group.name }}
              </h2>

              <Service
                v-for="(item, index) in group.items"
                :key="index"
                :item="item"
                :proxy="config.proxy"
                v-show="!group.collapsed"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div
          class="content has-text-centered"
          v-if="config.footer"
          v-html="config.footer"
        ></div>
      </div>
    </footer>
  </div>
</template>

<script>
import { parse } from "yaml";
import merge from "lodash.merge";

import Navbar from "./components/Navbar.vue";
import GetStarted from "./components/GetStarted.vue";
import ConnectivityChecker from "./components/ConnectivityChecker.vue";
import Service from "./components/Service.vue";
import Message from "./components/Message.vue";
import SearchInput from "./components/SearchInput.vue";
import SettingToggle from "./components/SettingToggle.vue";
import DarkMode from "./components/DarkMode.vue";
import DynamicTheme from "./components/DynamicTheme.vue";

import defaultConfig from "./assets/defaults.yml?raw";

export default {
  name: "App",
  components: {
    Navbar,
    GetStarted,
    ConnectivityChecker,
    Service,
    Message,
    SearchInput,
    SettingToggle,
    DarkMode,
    DynamicTheme,
  },
  data() {
    return {
      loaded: false,
      currentPage: null,
      configNotFound: false,
      config: null,
      services: null,
      filteredServices: null,
      offline: false,
      filter: "",
      vlayout: true,
      isDark: null,
      showMenu: false,
      allCollapsed: false,
    };
  },
  computed: {
    configurationNeeded() {
      return (this.loaded && !this.services) || this.configNotFound;
    },
  },
  created() {
    this.buildDashboard();
    window.onhashchange = this.buildDashboard;
    this.loaded = true;
  },
  methods: {
    searchHotkey() {
      return this.config?.hotkey?.search || "/";
    },
    buildDashboard: async function () {
      const defaults = parse(defaultConfig);
      let config;
      try {
        config = await this.getConfig();
        this.currentPage = window.location.hash.substring(1) || "default";

        if (this.currentPage !== "default") {
          const pageConfig = await this.getConfig(`assets/${this.currentPage}.yml`);
          config = Object.assign(config, pageConfig);
        }
      } catch (error) {
        console.log(error);
        config = this.handleErrors("⚠️ Error loading configuration", error);
      }

      this.config = merge(defaults, config);
      this.services = this.config.services.map((group) => ({
        ...group,
        collapsed: false,
      }));
      this.filteredServices = this.services;

      document.title = this.config.documentTitle || `${this.config.title} | ${this.config.subtitle}`;

      if (this.config.stylesheet) {
        let stylesheet = "";
        for (const file of this.config.stylesheet) {
          stylesheet += `@import "${file}";`;
        }
        this.createStylesheet(stylesheet);
      }
    },
    getConfig(path = "assets/config.yml") {
      return fetch(path).then((response) => {
        if (response.status == 404 || response.redirected) {
          this.configNotFound = true;
          return {};
        }
        if (!response.ok) {
          throw Error(`${response.statusText}: ${response.body}`);
        }

        return response.text().then((body) => parse(body, { merge: true }));
      });
    },
    filterServices(filter) {
      this.filter = filter?.toLowerCase() || "";
      if (!this.filter) {
        this.filteredServices = this.services;
        return;
      }

      this.filteredServices = this.services
        .map((group) => {
          const items = group.items.filter((item) =>
            [item.name, item.subtitle, item.tag, item.keywords]
              .filter(Boolean)
              .some((text) => text.toLowerCase().includes(this.filter))
          );

          return items.length > 0 ? { ...group, items, collapsed: false } : null;
        })
        .filter(Boolean);
    },
    resetFilter() {
      this.filter = "";
      this.filteredServices = this.services;
    },
    toggleAllGroups() {
      this.allCollapsed = !this.allCollapsed;
      this.filteredServices.forEach((group) => {
        group.collapsed = this.allCollapsed;
      });
    },
    handleErrors(title, content) {
      return {
        message: {
          title,
          style: "is-danger",
          content,
        },
      };
    },
    createStylesheet(css) {
      const style = document.createElement("style");
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    },
  },
};
</script>

<style>
.group-title {
  display: flex;
  align-items: center;
  cursor: default;
}
.group-logo {
  margin-right: 0.5rem;
}
</style>
