<template>
  <div
    id="app"
    v-if="config"
    :class="[
      `theme-${config.theme}`,
      `page-${currentPage}`,
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
              <img v-if="config.logo" :src="config.logo" alt="dashboard logo" />
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
          :defaultValue="this.config.defaults.colorTheme"
        />

        <SettingToggle
          @updated="vlayout = $event"
          name="vlayout"
          icon="fa-list"
          iconAlt="fa-columns"
          :defaultValue="this.config.defaults.layout == 'columns'"
        />

        <SearchInput
          class="navbar-item is-inline-block-mobile"
          :hotkey="searchHotkey()"
          @input="filterServices($event)"
          @search-focus="showMenu = true"
          @search-open="navigateToFirstService($event?.target?.value)"
          @search-cancel="filterServices()"
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
          <!-- Optional messages -->
          <Message :item="config.message" />

          <!-- Horizontal layout -->
          <div v-if="!vlayout || filter" class="columns is-multiline">
            <template v-for="(group, groupIndex) in services">
              <h2
                v-if="group.name"
                class="column is-full group-title"
                :key="`header-${groupIndex}`"
              >
                <i v-if="group.icon" :class="['fa-fw', group.icon]"></i>
                <div v-else-if="group.logo" class="group-logo media-left">
                  <figure class="image is-48x48">
                    <img :src="group.logo" :alt="`${group.name} logo`" />
                  </figure>
                </div>
                {{ group.name }}
              </h2>
              <Service
                v-for="(item, index) in group.items"
                :key="`service-${groupIndex}-${index}`"
                :item="item"
                :proxy="config.proxy"
                :class="['column', `is-${12 / config.columns}`]"
              />
            </template>
          </div>

          <!-- Vertical layout -->
          <div
            v-if="!filter && vlayout"
            class="columns is-multiline layout-vertical"
          >
            <div
              :class="['column', `is-${12 / config.columns}`]"
              v-for="(group, groupIndex) in services"
              :key="groupIndex"
            >
              <h2 v-if="group.name" class="group-title">
                <i v-if="group.icon" :class="['fa-fw', group.icon]"></i>
                <div v-else-if="group.logo" class="group-logo media-left">
                  <figure class="image is-48x48">
                    <img :src="group.logo" :alt="`${group.name} logo`" />
                  </figure>
                </div>
                {{ group.name }}
              </h2>
              <Service
                v-for="(item, index) in group.items"
                :key="index"
                :item="item"
                :proxy="config.proxy"
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
  data: function () {
    return {
      loaded: false,
      currentPage: null,
      configNotFound: false,
      config: null,
      services: null,
      offline: false,
      filter: "",
      vlayout: true,
      isDark: null,
      showMenu: false,
    };
  },
  computed: {
    configurationNeeded: function () {
      return (this.loaded && !this.services) || this.configNotFound;
    },
  },
  created: async function () {
    this.buildDashboard();
    window.onhashchange = this.buildDashboard;
    this.loaded = true;
  },
  methods: {
    searchHotkey() {
      if (this.config.hotkey && this.config.hotkey.search) {
        return this.config.hotkey.search;
      }
    },
    buildDashboard: async function () {
      const defaults = parse(defaultConfig);
      let config;
      try {
        config = await this.getConfig();
        this.currentPage = window.location.hash.substring(1) || "default";

        if (this.currentPage !== "default") {
          let pageConfig = await this.getConfig(
            `assets/${this.currentPage}.yml`,
          );
          config = Object.assign(config, pageConfig);
        }
      } catch (error) {
        console.log(error);
        config = this.handleErrors("⚠️ Error loading configuration", error);
      }
      this.config = merge(defaults, config);
      this.services = this.config.services;

      document.title =
        this.config.documentTitle ||
        `${this.config.title} | ${this.config.subtitle}`;
      if (this.config.stylesheet) {
        let stylesheet = "";
        let addtionnal_styles = this.config.stylesheet;
        if (!Array.isArray(this.config.stylesheet)) {
          addtionnal_styles = [addtionnal_styles];
        }
        for (const file of addtionnal_styles) {
          stylesheet += `@import "${file}";`;
        }
        this.createStylesheet(stylesheet);
      }
    },
    getConfig: function (path = "assets/config.yml") {
      return fetch(path).then((response) => {
        if (response.status == 404 || response.redirected) {
          this.configNotFound = true;
          return {};
        }

        if (!response.ok) {
          throw Error(`${response.statusText}: ${response.body}`);
        }

        const that = this;
        return response
          .text()
          .then((body) => {
            return parse(body, { merge: true });
          })
          .then(function (config) {
            if (config.externalConfig) {
              return that.getConfig(config.externalConfig);
            }
            return config;
          });
      });
    },
    matchesFilter: function (item) {
      const needle = this.filter?.toLowerCase();
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(needle)) ||
        (item.tag && item.tag.toLowerCase().includes(needle)) ||
        (item.keywords && item.keywords.toLowerCase().includes(needle))
      );
    },
    navigateToFirstService: function (target) {
      try {
        const service = this.services[0].items[0];
        window.open(service.url, target || service.target || "_self");
      } catch (error) {
        console.warning("fail to open service");
      }
    },
    filterServices: function (filter) {
      console.log(filter);
      this.filter = filter;

      if (!filter) {
        this.services = this.config.services;
        return;
      }

      const searchResultItems = [];
      for (const group of this.config.services) {
        if (group.items !== null) {
          for (const item of group.items) {
            if (this.matchesFilter(item)) {
              searchResultItems.push(item);
            }
          }
        }
      }

      this.services = [
        {
          name: filter,
          icon: "fas fa-search",
          items: searchResultItems,
        },
      ];
    },
    handleErrors: function (title, content) {
      return {
        message: {
          title: title,
          style: "is-danger",
          content: content,
        },
      };
    },
    createStylesheet: function (css) {
      let style = document.createElement("style");
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    },
  },
};
</script>
