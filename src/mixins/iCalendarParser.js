import { DateTime } from "luxon";

export default {
  methods: {
    extractEventFromICal: function (rawICal) {
      const vevent = this.extractVevent(rawICal);

      const title = this.extractText(vevent, "SUMMARY");
      const [start, startString] = this.extractTime(vevent, "DTSTART");
      // eslint-disable-next-line no-unused-vars
      const [end, _] = this.extractTime(vevent, "DTEND");
      const description = this.extractText(vevent, "DESCRIPTION");

      const event = {
        title: title,
        start: start,
        end: end,
        startString: startString,
        description: description,
      };

      return event;
    },
    extractVevent: function (data) {
      const startMarker = "BEGIN:VEVENT";
      const endMarker = "END:VEVENT";
      const regex = new RegExp(`${startMarker}(.*?)${endMarker}`, "s");
      const match = data.match(regex);
      return match ? match[1].trim() : null;
    },
    extractText: function (data, propertyName) {
      const regex = new RegExp(`${propertyName}:(.*?)(\\r?\\n|$)`);
      const match = data.match(regex);
      return match ? match[1].trim() : null;
    },
    extractTime: function (data, propertyName) {
      // Match propertyName with optional parameters and extract the value after ':'
      // Example matches: DTSTART;TZID=Europe/Berlin:20030201T010000, DTSTART;VALUE=DATE:20030201
      const partsMatch = data.match(`${propertyName}(?:(;[^:]*)?)?:([0-9T]+)`);

      if (!partsMatch) {
        return null;
      }

      // Extract timezone
      let timeZone = "UTC";
      if (partsMatch[1]) {
        const tzidMatch = partsMatch[1].match(/;TZID=([^;:]*)/);
        if (tzidMatch) {
          timeZone = tzidMatch[1];
        }
      }
      const dateTimeStr = partsMatch[2];

      // If it's a date-only value, parse as Date (YYYYMMDD)
      if (partsMatch[1] && partsMatch[1].includes("VALUE=DATE")) {
        const parsedDate = DateTime.fromFormat(dateTimeStr, "yyyyMMdd", {
          zone: timeZone,
        });
        return [
          parsedDate,
          parsedDate.toLocaleString({
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        ];
      }

      const parsedDateTime = DateTime.fromFormat(
        dateTimeStr,
        "yyyyMMdd'T'HHmmss",
        { zone: timeZone },
      );

      return [
        parsedDateTime,
        parsedDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, {
          timeZone,
        }),
      ];
    },
  },
};
