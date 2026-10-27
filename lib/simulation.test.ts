import assert from "node:assert/strict";
import { CONTACTS, ROUTE_WAYPOINTS } from "./seed.ts";
import { matchQA } from "./assistant.ts";
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
console.log("simulation tests passed");
