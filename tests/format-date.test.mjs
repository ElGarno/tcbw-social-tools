import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDateLong } from "../src/lib/format-date.js";

test("formatDateLong: 09.05.2026 → '9. Mai'", () => {
  assert.equal(formatDateLong("09.05.2026"), "9. Mai");
});

test("formatDateLong: 30.05.2026 → '30. Mai'", () => {
  assert.equal(formatDateLong("30.05.2026"), "30. Mai");
});

test("formatDateLong: 13.06.2026 → '13. Juni'", () => {
  assert.equal(formatDateLong("13.06.2026"), "13. Juni");
});

test("formatDateLong: empty → empty", () => {
  assert.equal(formatDateLong(""), "");
  assert.equal(formatDateLong(null), "");
  assert.equal(formatDateLong(undefined), "");
});
