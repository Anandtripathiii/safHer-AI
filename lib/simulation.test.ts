import assert from "node:assert/strict";
import { CONTACTS, ROUTE_WAYPOINTS } from "./seed.ts";
import { matchQA } from "./assistant.ts";
import { calculate } from "./calc.ts";
import { heardSafeWord } from "./voice.ts";
import { pickFemaleVoice } from "./sound.ts";
import { routeScores, routesFor } from "./simulation.ts";
import { coordinationAt, coordinationScript, pointAt, NO_RESPONSE_AFTER } from "./simulation.ts";

const primary = CONTACTS.filter((c) => !c.escalation).map((c) => c.id);
const script = coordinationScript(CONTACTS, false);

let s = coordinationAt(script, primary, 0.5);
assert.deepEqual(s.status, { mom: "pending", dad: "pending", priya: "pending" });
s = coordinationAt(script, primary, 4.5);
assert.equal(s.status.mom, "viewed");
s = coordinationAt(script, primary, 10);
assert.equal(s.status.mom, "acknowledged");
assert.equal(s.escalated, false);
s = coordinationAt(script, primary, 2 + NO_RESPONSE_AFTER + 1);
assert.equal(s.status.priya, "no-response");
assert.equal(s.escalated, true);
s = coordinationAt(script, primary, 60);
assert.equal(s.status.campus, "acknowledged");

// weak network: delivery arrives later, via SMS
const weak = coordinationScript(CONTACTS, true);
assert.equal(coordinationAt(weak, primary, 2).status.mom, "pending");
assert.equal(weak.find((e) => e.status === "delivered")!.channel, "SMS");

// position interpolation hits both ends
assert.deepEqual(pointAt(ROUTE_WAYPOINTS.safer, 0), ROUTE_WAYPOINTS.safer[0]);
assert.deepEqual(pointAt(ROUTE_WAYPOINTS.safer, 1), ROUTE_WAYPOINTS.safer.at(-1));
// assistant keyword matching
assert.equal(matchQA("how do I change my safe word?", "en")!.id, "safeword");
assert.equal(matchQA("which route is safer", "en")!.id, "route");
assert.equal(matchQA("मुझे कौन ट्रैक कर रहा है?", "hi")!.id, "tracking");
assert.equal(matchQA("জরুরি নম্বর", "bn")!.id, "numbers");
assert.equal(matchQA("what's the weather", "en"), null);
// disguise calculator
assert.equal(calculate("12+3×4"), 24);
assert.equal(calculate("10÷4−1"), 1.5);
assert.equal(calculate("7"), 7);
assert.equal(calculate("5+"), null);
assert.ok(Number.isNaN(calculate("1÷0")!));

// night routing: fastest gets a warning only after dark; safer always takes 3 min longer
assert.ok(routeScores("fastest", true, 12).warning);
assert.equal(routeScores("fastest", false, 12).warning, undefined);
assert.equal(routeScores("safer", true, 12).minutes, 15);
assert.equal(routesFor([0, 0], [1, 1]).fastest.length, 3);
// safe word: case-insensitive, anywhere in the sentence; never fires on an empty word
assert.ok(heardSafeWord("ok so I want a PINEAPPLE juice", "pineapple"));
assert.ok(heardSafeWord("call me on the blue umbrella line", "Blue Umbrella"));
assert.ok(!heardSafeWord("help me", "pineapple"));
assert.ok(heardSafeWord("I want pine apple.", "pineapple"));
assert.ok(!heardSafeWord("anything", "   "));
// female voice picker: language + name priority, a different voice for the caller, null when none exist
const V = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice;
const voices = [V("Microsoft David", "en-US"), V("Microsoft Ravi", "en-IN"), V("Microsoft Zira", "en-US"), V("Microsoft Heera", "en-IN"), V("Google UK English Female", "en-GB"), V("Microsoft Kalpana", "hi-IN")];
const malenia = pickFemaleVoice(voices, "en-IN")!;
assert.equal(malenia.name, "Microsoft Heera");
assert.equal(pickFemaleVoice(voices, "en-IN", malenia)!.name, "Google UK English Female");
assert.equal(pickFemaleVoice(voices, "hi-IN")!.name, "Microsoft Kalpana");
assert.equal(pickFemaleVoice([V("Microsoft David", "en-US")], "en-IN"), null);
console.log("simulation tests passed");
