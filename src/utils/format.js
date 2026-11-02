// TODO(cards-migrate-to-api): the follow-up moves the rest of the card
// formatters here, off the cards and the service mixin.
export function capCount(value, max = 99) {
  return typeof value === "number" && value > max ? `${max}+` : value;
}
