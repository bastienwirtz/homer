<template>
    <Generic :item="item">
        <template #indicator>
            <div class="notifs">
                <strong class="notif total" title="Total Devices">
                    {{ total }}
                </strong>
                <strong class="notif connected" title="Connected Devices">
                    {{ connected }}
                </strong>
                <strong class="notif newdevices" title="New Devices">
                    {{ newdevices }}
                </strong>
                <strong class="notif alert" title="Down Alerts">
                    {{ downalert }}
                </strong>
                <strong v-if="serverError" class="notif alert"
                    title="Connection error to PiAlert server, check the url in config.yml">?</strong>
            </div>
        </template>
    </Generic>
</template>
  
<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
    name: "PiAlert",
    mixins: [service],
    props: {
        item: Object,
    },
    components: {
        Generic,
    },
    data: () => {
        return {
            total: 0,
            connected: 0,
            newdevices: 0,
            downalert: 0,
            serverError: false,
        };
    },
    created() {
        const updateInterval = parseInt(this.item.updateInterval, 10) || 0;
        if (updateInterval > 0) {
            setInterval(() => this.fetchStatus(), updateInterval);
        }
        this.fetchStatus();
    },
    methods: {
        fetchStatus: async function () {
            this.fetch("/php/server/devices.php?action=getDevicesTotals")
                .then((response) => {
                    this.total = response[0];
                    this.connected = response[1];
                    this.newdevices = response[3];
                    this.downalert = response[4];
                })
                .catch((e) => {
                    console.log(e);
                    this.serverError = true;
                });
        },
    },
};
</script>
  
<style scoped lang="scss">
.notifs {
    position: absolute;
    color: white;
    font-family: sans-serif;
    top: 0.3em;
    right: 0.5em;

    .notif {
        display: inline-block;
        padding: 0.2em 0.35em;
        border-radius: 0.25em;
        position: relative;
        margin-left: 0.3em;
        font-size: 0.8em;

        &.total {
            background-color: #4fb5d6;
        }

        &.connected {
            background-color: #4fd671;
        }

        &.newdevices {
            background-color: #d08d2e;
        }

        &.alert {
            background-color: #e51111;
        }
    }
}
</style>