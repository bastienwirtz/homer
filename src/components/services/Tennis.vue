<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">
        <span
          v-if="match"
          class="players"
          :title="`${match.p1} vs ${match.p2}`"
        >
          <span v-if="match.server === 1" class="serving" title="Serving"
            >●</span
          >{{ match.p1 }} <span class="versus">vs</span> {{ match.p2
          }}<span v-if="match.server === 2" class="serving" title="Serving"
            >●</span
          >
        </span>
        <template v-else>{{ item.name }}</template>
      </p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">{{ item.subtitle }}</template>
        <template v-else-if="serverError">Live Tennis API unreachable</template>
        <template v-else-if="!matches">Loading…</template>
        <template v-else-if="match">{{ subtitle }}</template>
        <template v-else>No live match</template>
      </p>
    </template>
    <template #indicator>
      <div class="score">
        <strong v-if="match && match.sets" class="sets" title="Sets">{{
          match.sets
        }}</strong>
        <span v-if="match && match.games" class="games" title="Current set">{{
          match.games
        }}</span>
        <strong
          v-if="serverError"
          class="error"
          title="Connection error to the Live Tennis API, check endpoint and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import service from "@/mixins/service.js";

export default {
  name: "Tennis",
  mixins: [service],
  props: {
    item: Object,
  },
  data: () => ({
    matches: null,
    serverError: false,
  }),
  computed: {
    limit() {
      const limit = parseInt(this.item.limit, 10) || 5;
      return Math.min(Math.max(limit, 1), 10);
    },
    match() {
      return this.matches?.[0] ?? null;
    },
    subtitle() {
      const others = this.matches.length - 1;
      return others > 0
        ? `${this.match.tournament} · +${others} more`
        : this.match.tournament;
    },
  },
  created() {
    this.autoUpdateMethod = this.fetchMatches;
    this.fetchMatches();
  },
  methods: {
    fetchMatches() {
      const headers = {};
      if (this.item.apikey) {
        headers["X-API-Key"] = this.item.apikey;
      }

      let path = `matches?status=live&limit=${this.limit}`;
      if (this.item.tour) {
        path += `&tour=${encodeURIComponent(this.item.tour)}`;
      }

      this.fetch(path, { headers })
        .then((response) => {
          // List endpoints answer with `{data: [...], meta: {...}}`.
          this.matches = (response.data ?? []).map(this.summarize);
          this.serverError = false;
        })
        .catch((e) => {
          console.error(e);
          this.serverError = true;
        });
    },
    // Reduce the payload to the few strings the card displays, so rendering
    // never has to walk the (partly nullable) nested objects.
    summarize(match) {
      const players = match.players ?? {};
      const score = match.score;
      return {
        id: match.id,
        tournament: this.event(match.tournament, match.round),
        p1: players.p1?.name ?? "?",
        p2: players.p2?.name ?? "?",
        server: score?.server,
        // Sets won, e.g. "1-0". `score` is null until a match starts.
        sets: this.pair(score?.sets),
        // Games of the set in progress and current points, e.g. "6-5 40-40".
        // `games` holds one list of games per player, one entry per set, so
        // the set being played is the last entry of each.
        games: [
          this.pair(score?.games?.map((perSet) => perSet?.at(-1))),
          this.pair(score?.points),
        ]
          .filter(Boolean)
          .join(" "),
      };
    },
    // `round` usually repeats the tournament ("W50 Horb - 1/16-finals"), so
    // only its last segment is kept to build "W50 Horb (Germany) · 1/16-finals".
    event(tournament, round) {
      const phase = (round ?? "").split(" - ").at(-1).trim();
      if (!phase || tournament?.includes(phase)) {
        return tournament ?? phase;
      }
      return tournament ? `${tournament} · ${phase}` : phase;
    },
    pair(values) {
      if (!Array.isArray(values) || values.length !== 2) {
        return "";
      }
      return values.every((value) => value !== undefined && value !== null)
        ? `${values[0]}-${values[1]}`
        : "";
    },
  },
};
</script>

<style scoped lang="scss">
.players {
  .serving {
    color: var(--highlight-primary);
    font-size: 0.6em;
    margin: 0 0.3em;
    vertical-align: middle;

    &:first-child {
      margin-left: 0;
    }
  }

  .versus {
    color: var(--text-subtitle);
    font-size: 0.8em;
    font-weight: 400;
  }
}

.score {
  align-self: center;
  font-variant-numeric: tabular-nums;
  padding-left: 0.5em;
  text-align: right;
  white-space: nowrap;

  .sets {
    color: var(--text-title);
    display: block;
    font-size: 1.1em;
    line-height: 1.2;
  }

  .games {
    color: var(--text-subtitle);
    font-size: 0.8em;
  }

  .error {
    background-color: #e51111;
    border-radius: 0.25em;
    color: white;
    display: inline-block;
    font-size: 0.8em;
    padding: 0.2em 0.35em;
  }
}
</style>
