<template>
    <Generic :item="item">
      <template #content>
        <p class="title is-4">{{ item.name }}</p>
        <p class="subtitle is-6">
          <template v-if="item.subtitle">
            {{ item.subtitle }}
          </template>
          <template v-else-if="vms">
            <div v-if="loading">
              <strong>Loading...</strong>
            </div>
            <div v-else-if="error">
              <strong class="danger">Error loading info</strong>
            </div>
            <div v-else class="metrics" :class="{'is-size-7-mobile': item.small_font_on_small_screens}">
              <span v-if="showValue('vms')" class="margined">VMs: <span class="is-number"><span class="has-text-weight-bold">{{ vms.running }}</span>/{{vms.total}}</span></span>
              <span v-if="showValue('disk')" class="margined">Disk: <span class="has-text-weight-bold is-number" :class="statusClass(diskUsed)">{{ getStatValue(diskUsed) }}%</span></span>
              <span v-if="showValue('mem')" class="margined">Mem: <span class="has-text-weight-bold is-number" :class="statusClass(memoryUsed)">{{ getStatValue(memoryUsed) }}%</span></span>
              <span v-if="showValue('cpu')" class="margined">CPU: <span class="has-text-weight-bold is-number" :class="statusClass(cpuUsed)">{{ getStatValue(cpuUsed) }}%</span></span>
            </div>
          </template>
        </p>
      </template>
      <template #indicator>
        <i v-if="loading" class="fa fa-circle-notch fa-spin fa-2xl"></i>
        <i v-if="error" class="fa fa-exclamation-circle fa-2xl danger"></i>
      </template>
    </Generic>
  </template>
  
  <script>
  import service from "@/mixins/service.js";
  import Generic from "./Generic.vue";
  
  export default {
    name: "Proxmox",
    mixins: [service],
    props: {
      item: Object,
    },
    components: {
      Generic,
    },
    data: () => ({
      vms: {
        total: 0,
        running: 0
      },
      memoryUsed: 0,
      diskUsed: 0,
      cpuUsed: 0,
      hide: [],
      error: false,
      loading: true
    }),
    created() {
      if (this.item.hide) this.hide = this.item.hide;
      this.fetchStatus();
    },
    methods: {
      statusClass(value) {
        if (value > this.item.danger_value) return 'danger';
        if (value > this.item.warning_value) return 'warning';
        return 'healthy'
      },
      fetchStatus: async function () {
        try {
          const options = {
            headers: {
              "Authorization": this.item.api_token
            }
          }
          const status = await this.fetch(`/api2/json/nodes/${this.item.node}/status`, options);
          // main metrics:
          this.memoryUsed = ( (status.data.memory.used * 100) / status.data.memory.total ).toFixed(1);
          this.diskUsed = ( (status.data.rootfs.used * 100) / status.data.rootfs.total ).toFixed(1);
          this.cpuUsed = (status.data.cpu * 100).toFixed(1);
          // vms:
          if (this.showValue('vms')) {
            const vms = await this.fetch(`/api2/json/nodes/${this.item.node}/qemu`, options);
            this.vms.total += vms.data.length;
            this.vms.running += vms.data.filter( i => i.status === 'running' ).length;
            // if no vms, hide this value:
            if (this.vms.total == 0) this.hide.push('vms');
          }
          this.error = false;
        } catch(err) {
          console.log(err);
          this.error = true;
        }
        this.loading = false;
      },
      getStatValue(value) {
        return this.item.hide_decimals ? value.split('.')[0] : value;
      },
      showValue(value) {
        return this.hide.indexOf(value) == -1;
      }
    },
  };
  </script>
  
  <style scoped lang="scss">
  .is-number {
    font-family: "Lato"
  }
  .healthy {
    color: green
  }
  .warning {
    color: orange
  }
  .danger {
    color: red
  }
  .metrics .margined:not(:first-child) {
    margin-left: 0.3rem;
  }
  </style>
  