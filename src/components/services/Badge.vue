<template>
    <Generic :item="item">
    <template #indicator>
        <div>
        <img :src=item.badge>
        </div>
    </template>
    </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";

export default {
    name: "Badge",
    mixins: [service],
    props: {
        item: Object,
    },
    components: {
        Generic,
    }
    
};
</script>
