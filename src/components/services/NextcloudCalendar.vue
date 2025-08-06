<template>
  <Generic v-for="event in events" :key="event.name" :item="event"> </Generic>
</template>

<script>
import service from "@/mixins/service.js";
import Generic from "./Generic.vue";
import { DateTime } from "luxon";
import calendar from "../../mixins/iCalendarParser";

export default {
  name: "NextcloudCalendar",
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
    davRequest: function () {
      const headers = {
        Authorization: "Basic " + btoa(`${this.item.user}:${this.item.token}`),
        "Content-Type": "text/xml",
        Accept: "application/xml",
        Depth: "1",
      };

      const startDate = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'");

      const body = `
      <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
        <d:prop>
          <d:getetag />
          <c:calendar-data />
        </d:prop>
        <c:filter>
          <c:comp-filter name="VCALENDAR">
            <c:comp-filter name="VEVENT">
              <c:time-range start="${startDate}"/>
            </c:comp-filter>
          </c:comp-filter>
        </c:filter>
      </c:calendar-query>
      `;

      return {
        method: "REPORT",
        headers,
        body: body,
      };
    },
  },
  created() {
    this.fetchCalDavEvents();
  },
  methods: {
    fetchCalDavEvents: async function () {
      this.fetch("", this.davRequest, false).then((response) => {
        const eventsResponse = this.parseCalDavResponse(response);
        this.events = eventsResponse
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
    parseCalDavResponse: function (response) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, "application/xml");

      // Get all event nodes
      const calendarData = xmlDoc.getElementsByTagName("cal:calendar-data");

      // Store event details
      const events = [];

      for (let i = 0; i < calendarData.length; i++) {
        const icalData = calendarData[i].textContent.trim();

        events.push(this.extractEventFromICal(icalData));
      }

      events.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });

      return events;
    },
  },
};
</script>
