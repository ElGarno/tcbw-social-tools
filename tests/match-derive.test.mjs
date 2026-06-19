import { test } from "node:test";
import assert from "node:assert/strict";
import { announcementCopy, splitResult } from "../src/lib/match-derive.js";

test("announcementCopy: home league", () => {
  assert.deepEqual(announcementCopy(true, "league"), {
    eyebrow: "Nächstes Heimspiel", connector: "vs.", cta: "Komm vorbei", badge: null,
  });
});

test("announcementCopy: away league has badge + away wording", () => {
  assert.deepEqual(announcementCopy(false, "league"), {
    eyebrow: "Auswärtsspiel", connector: "bei", cta: "Daumen drücken", badge: "Auswärts",
  });
});

test("announcementCopy: pokal home + away", () => {
  assert.equal(announcementCopy(true, "pokal").eyebrow, "Pokal-Heimspiel");
  assert.equal(announcementCopy(false, "pokal").eyebrow, "Pokal-Auswärtsspiel");
  assert.equal(announcementCopy(false, "pokal").badge, "Auswärts");
});

test("splitResult: home perspective keeps order", () => {
  assert.deepEqual(splitResult("6:3", true), { us: "6", them: "3" });
});

test("splitResult: away perspective flips", () => {
  assert.deepEqual(splitResult("1:2", false), { us: "2", them: "1" });
});

test("splitResult: unparseable returns null", () => {
  assert.equal(splitResult("", true), null);
  assert.equal(splitResult(null, true), null);
  assert.equal(splitResult("abc", true), null);
});
