<template>
    <Generic :item="item">
      <template #content>
        <p class="title is-4">{{ item.name }}</p>
        <p class="subtitle is-6">
          <template v-if="item.subtitle">
            {{ item.subtitle }}
          </template>
          <template v-else-if="vms">
            <div v-if="error">
              <strong class="danger">Error loading info!</strong>
            </div>
            <div v-else class="metrics">
              <span>VMs: <span class="is-number"><strong>{{ vms.running }}</strong>/{{vms.total}}</span></span>
              <span>Disk: <strong class="is-number" :class="statusClass(diskUsed)">{{ diskUsed }}%</strong></span>
              <span>Mem: <strong class="is-number" :class="statusClass(memoryUsed)">{{ memoryUsed }}%</strong></span>
              <span>CPU: <strong class="is-number" :class="statusClass(cpuUsed)">{{ cpuUsed }}%</strong></span>
            </div>
          </template>
        </p>
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
      error: false
    }),
    created() {
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
          const vms = await this.fetch(`/api2/json/nodes/${this.item.node}/qemu`, options);
          this.vms.total += vms.data.length;
          this.vms.running += vms.data.filter( i => i.status === 'running' ).length;
          this.error = false;
        } catch(err) {
          console.log(err);
          this.error = true;
        }
      },
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
  .metrics {
    display: flex;
    justify-content: space-between;
  }
  </style>
  