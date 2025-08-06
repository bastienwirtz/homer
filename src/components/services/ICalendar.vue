<template>
  <Generic v-for="event in events" :key="event.name" :item="event"> </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
import { DateTime } from "luxon";
import calendar from "../../mixins/iCalendarParser";

export default {
  name: "ICalendar",
  components: {
    Generic,
  },
  mixins: [service, calendar],
  props: {
    item: Object,
  },
  data: () => ({
    events: [],
  }),
  computed: {
    calculatedLimit: function () {
      const limit = parseInt(this.item.limit) || 5;
      return Math.min(Math.max(limit, 1), 15);
    },
    iCalRequest: function () {
      const headers = {
        Authorization: this.item.user
          ? "Basic " + btoa(`${this.item.user}:${this.item.token}`)
          : undefined,
      };

      return {
        method: "GET",
        headers,
      };
    },
  },
  created() {
    this.fetchICalendarEvents();
  },
  methods: {
    fetchICalendarEvents: async function () {
      this.fetch("", this.iCalRequest, false).then((response) => {
        const eventsResponse = this.parseICalendarResponse(response);
        const filteredEvents = this.filterPastEvents(eventsResponse);
        this.events = filteredEvents
          .slice(0, this.calculatedLimit)
          .map((event) => ({
            name: event.title,
            subtitle: event.description,
            icon: "fas fa-calendar-plus",
            quick: [
              {
                name: event.startString,
                color: event.start < DateTime.now() ? "lightgreen" : "white",
              },
            ],
          }));
      });
    },
    parseICalendarResponse: function (response) {
      const eventBlocks =
        response.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

      const events = [];

      for (let i = 0; i < eventBlocks.length; i++) {
        const icalData = eventBlocks[i].trim();

        events.push(this.extractEventFromICal(icalData));
      }

      events.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });

      return events;
    },
    filterPastEvents: function (events) {
      return events.filter((event) => {
        return event.end >= DateTime.now();
      });
    },
  },
};
</script>
