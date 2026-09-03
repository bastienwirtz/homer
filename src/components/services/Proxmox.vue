<template>
  <Generic :item="item" :badges="badges">
    <template v-if="vms" #subtitle>
      <div v-if="loading">
        <strong>Loading...</strong>
      </div>
      <div v-else-if="serverError">
        <strong class="danger">Error loading info</strong>
      </div>
      <div
        v-else
        class="metrics"
        :class="{
          'is-size-7-mobile': item.small_font_on_small_screens,
          'is-small': item.small_font_on_desktop,
        }"
      >
        <span v-if="isValueShown('vms')" class="margined"
          >VMs:
          <span class="is-number"
            ><span class="has-text-weight-bold">{{ vms.running }}</span
            ><span v-if="isValueShown('vms_total')"
              >/{{ vms.total }}</span
            ></span
          ></span
        >
        <span v-if="isValueShown('lxcs') && lxcs.total" class="margined"
          >LXCs:
          <span class="is-number"
            ><span class="has-text-weight-bold">{{ lxcs.running }}</span
            ><span v-if="isValueShown('lxcs_total')"
              >/{{ lxcs.total }}</span
            ></span
          ></span
        >
        <span v-if="isValueShown('disk')" class="margined"
          >Disk:
          <span
            class="has-text-weight-bold is-number"
            :class="statusClass(diskUsed)"
            >{{ diskUsed }}%</span
          ></span
        >
        <span v-if="isValueShown('mem')" class="margined"
          >Mem:
          <span
            class="has-text-weight-bold is-number"
            :class="statusClass(memoryUsed)"
            >{{ memoryUsed }}%</span
          ></span
        >
        <span v-if="isValueShown('cpu')" class="margined"
          >CPU:
          <span
            class="has-text-weight-bold is-number"
            :class="statusClass(cpuUsed)"
            >{{ cpuUsed }}%</span
          ></span
        >
      </div>
    </template>
    <template v-if="loading" #aside>
      <i class="fa fa-circle-notch fa-spin fa-2xl"></i>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Proxmox",
  mixins: [service],
  data: () => ({
    vms: {
      total: 0,
      running: 0,
    },
    lxcs: {
      total: 0,
      running: 0,
    },
    memoryUsed: 0,
    diskUsed: 0,
    cpuUsed: 0,
    serverError: null,
    loading: true,
  }),
  computed: {
    badges() {
      return [this.connectionBadge()];
    },
  },
  methods: {
    statusClass(value) {
      if (value > this.item.danger_value) return "danger";
      if (value > this.item.warning_value) return "warning";
      return "healthy";
    },
    fetchData: async function () {
      try {
        const options = {
          headers: {
            Authorization: this.item.api_token,
          },
        };
        const status = await this.fetch(
          `/api2/json/nodes/${this.item.node}/status`,
          options,
        );
        // main metrics:
        const decimalsToShow = this.item.hide_decimals ? 0 : 1;
        this.memoryUsed = (
          (status.data.memory.used * 100) /
          status.data.memory.total
        ).toFixed(decimalsToShow);
        this.diskUsed = (
          (status.data.rootfs.used * 100) /
          status.data.rootfs.total
        ).toFixed(decimalsToShow);
        this.cpuUsed = (status.data.cpu * 100).toFixed(decimalsToShow);
        // vms:
        if (this.isValueShown("vms")) {
          const vms = await this.fetch(
            `/api2/json/nodes/${this.item.node}/qemu`,
            options,
          );
          this.parseVMsAndLXCs(vms, this.vms);
        }
        // lxc containers:
        if (this.isValueShown("lxcs")) {
          const lxcs = await this.fetch(
            `/api2/json/nodes/${this.item.node}/lxc`,
            options,
          );
          this.parseVMsAndLXCs(lxcs, this.lxcs);
        }
        this.serverError = false;
      } catch (err) {
        console.error(err);
        this.serverError = true;
      }
      this.loading = false;
    },
    parseVMsAndLXCs(items, value) {
      value.total = items.data.length;
      value.running = items.data.filter((i) => i.status === "running").length;
    },
  },
};
</script>

<style scoped lang="scss">
.healthy {
  color: var(--status-online);
}
.warning {
  color: var(--status-warning);
}
.danger {
  color: var(--status-offline);
}
.metrics .margined:not(:first-child) {
  margin-left: 0.3rem;
}
.is-small {
  font-size: small;
}
</style>
