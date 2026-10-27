// Builds a printable incident report for a police complaint from an SOS event.
// Synthetic demo data: every page is watermarked and footed as a sample, never an official document.
import { HELP_POINTS, ROUTE_WAYPOINTS, USER, type Contact, type LatLng, type SafeEvent } from "./seed";
import { coordinationAt, coordinationScript, distM, pointAt, type DeliveryStatus } from "./simulation";

export type ReportInput = { event: SafeEvent; durationSec: number; contacts: Contact[]; network: "good" | "weak" };

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: "Pending", delivered: "Delivered", viewed: "Viewed location", acknowledged: "Acknowledged", "no-response": "No response — escalated",
};
const OUTCOME: Record<SafeEvent["status"], string> = {
  resolved: "Resolved — complainant confirmed safe",
  escalated: "Escalated to escalation contact, then resolved",
  "false-alarm": "Cancelled by complainant as a false alarm",
  active: "Ongoing at time of report",
  completed: "Completed",
  cancelled: "Cancelled",
};

const fmt = (ts: number) => new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

/** Simulated GPS fixes every 20 s from the moment the SOS fired. */
function gpsTrail(ts: number, durationSec: number) {
  const n = Math.min(8, Math.max(3, Math.ceil(durationSec / 20)));
  return Array.from({ length: n }, (_, i) => {
    const [lat, lng] = pointAt(ROUTE_WAYPOINTS.safer, 0.1 + i * 0.03);
    return { at: ts + i * 20_000, lat, lng, acc: 6 + ((i * 7) % 9) };
  });
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function downloadPoliceReport({ event, durationSec, contacts, network }: ReportInput) {
  const { jsPDF, GState } = await import("jspdf");

  // Who was alerted, in order, and how each responded by the time the alert ended.
  const chain: Contact[] = event.notified.map((name, i) => contacts.find((c) => c.name === name) ?? { id: `n${i}`, name, initials: "", phone: "", relation: "", color: "", escalation: /security/i.test(name) });
  const primary = chain.filter((c) => !c.escalation);
  const { status } = coordinationAt(coordinationScript(chain, network !== "good"), primary.map((c) => c.id), durationSec);
  const trail = gpsTrail(event.ts, durationSec);
  const start: LatLng = [trail[0].lat, trail[0].lng];
  const station = HELP_POINTS.filter((h) => h.kind === "police").sort((a, b) => distM(a.pos, start) - distM(b.pos, start))[0];
  const reportNo = `SH-${new Date(event.ts).toISOString().slice(0, 10).replace(/-/g, "")}-${event.id.slice(-4).toUpperCase()}`;
  const generated = Date.now();
  const payload = { reportNo, event, durationSec, trail, contacts: chain.map((c) => ({ name: c.name, status: status[c.id] ?? "pending" })), network };
  const hash = await sha256(JSON.stringify(payload));

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 18, CW = W - 2 * M;
  let y = 0;

  const watermark = () => {
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.07 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(58);
    doc.setTextColor(120, 40, 70);
    doc.text("SAMPLE — DEMO DATA", W / 2, 170, { align: "center", angle: 35 });
    doc.restoreGraphicsState();
  };
  const ensure = (need: number) => { if (y + need > 272) { doc.addPage(); watermark(); y = 20; } };
  const heading = (label: string) => {
    ensure(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(43, 33, 64);
    doc.text(label.toUpperCase(), M, y);
    doc.setDrawColor(225, 149, 171); doc.setLineWidth(0.5); doc.line(M, y + 1.6, W - M, y + 1.6);
    y += 7;
  };
  const para = (text: string, size = 10) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(31, 26, 43);
    const lines = doc.splitTextToSize(text, CW);
    ensure(lines.length * 5);
    doc.text(lines, M, y);
    y += lines.length * (size * 0.45) + 2;
  };
  const kv = (rows: [string, string][]) => {
    for (const [k, v] of rows) {
      const lines = doc.splitTextToSize(v, CW - 52);
      ensure(lines.length * 5 + 1);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(107, 100, 120); doc.text(k, M, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(31, 26, 43); doc.text(lines, M + 52, y);
      y += lines.length * 4.6 + 1.4;
    }
    y += 2;
  };
  const table = (head: string[], rows: string[][], widths: number[]) => {
    const rowH = 6.4;
    ensure(rowH * 2);
    doc.setFillColor(242, 249, 255); doc.rect(M, y - 4.4, CW, rowH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(43, 33, 64);
    let x = M + 2;
    head.forEach((h, i) => { doc.text(h, x, y); x += widths[i]; });
    y += rowH;
    doc.setFont("helvetica", "normal"); doc.setTextColor(31, 26, 43);
    rows.forEach((r, ri) => {
      ensure(rowH);
      if (ri % 2) { doc.setFillColor(250, 250, 252); doc.rect(M, y - 4.4, CW, rowH, "F"); }
      x = M + 2;
      r.forEach((cell, i) => { doc.text(cell, x, y); x += widths[i]; });
      y += rowH;
    });
    doc.setDrawColor(230, 234, 242); doc.setLineWidth(0.2); doc.line(M, y - 4.4, W - M, y - 4.4);
    y += 4;
  };

  // Header band
  watermark();
  doc.setFillColor(43, 33, 64); doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.text("INCIDENT REPORT", M, 14);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.text("Prepared for filing a police complaint · generated by SafeHer AI", M, 21);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(`Report No. ${reportNo}`, W - M, 14, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.text(`Generated ${fmt(generated)} IST`, W - M, 21, { align: "right" });
  y = 42;

  // Addressee + subject, as in a written complaint
  para(`To,\nThe Station House Officer,\n${station.name},\nNew Delhi.`);
  y += 1;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(31, 26, 43);
  const subject = doc.splitTextToSize(`Subject: Complaint regarding an incident on ${fmt(event.ts).split(",")[0]} at about ${fmt(event.ts).split(",")[1]?.trim()} IST, in which an emergency SOS was raised.`, CW);
  doc.text(subject, M, y); y += subject.length * 5 + 3;
  para(`Respected Sir/Madam,\nI wish to report the incident below. The details were recorded automatically by my safety app at the time the alert was raised and are attached for your reference.`);

  heading("1. Complainant");
  kv([["Name", USER.name], ["Contact", USER.phone], ["Area", USER.city]]);

  heading("2. Incident summary");
  kv([
    ["Alert raised", fmt(event.ts) + " IST"],
    ["How it was raised", event.title.replace(/^SOS — /, "")],
    ["Duration of alert", `${Math.floor(durationSec / 60)} min ${durationSec % 60} s`],
    ["Outcome", OUTCOME[event.status]],
    ["Notes", event.detail],
  ]);

  heading("3. Location trail (GPS)");
  table(["#", "Time (IST)", "Latitude", "Longitude", "Accuracy"], trail.map((p, i) => [String(i + 1), fmt(p.at).split(",")[1].trim(), p.lat.toFixed(5), p.lng.toFixed(5), `±${p.acc} m`]), [10, 40, 40, 40, 30]);

  heading("4. Device state at time of alert");
  kv([["Battery level", event.battery !== undefined ? `${event.battery}%` : "Not recorded"], ["Network", network === "good" ? "Mobile data (push + SMS)" : "Weak — alerts sent by SMS fallback"]]);

  heading("5. Persons notified");
  table(["Order", "Name", "Relationship", "Response"], chain.map((c, i) => [String(i + 1), c.name, c.escalation ? "Escalation contact" : c.relation || "Trusted contact", STATUS_LABEL[status[c.id] ?? "pending"]]), [18, 50, 50, 56]);

  heading("6. Evidence");
  kv([
    ["Audio recording", `Captured automatically during the alert (${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}). Stored encrypted on the complainant's device; available on request.`],
    ["Integrity (SHA-256)", hash],
  ]);

  heading("Declaration");
  para("I declare that the information above is true to the best of my knowledge. I request that appropriate action be taken.");
  ensure(24);
  y += 12;
  doc.setDrawColor(31, 26, 43); doc.setLineWidth(0.3);
  doc.line(M, y, M + 60, y); doc.line(W - M - 50, y, W - M, y);
  doc.setFontSize(9); doc.setTextColor(107, 100, 120);
  doc.text(`Signature — ${USER.name}`, M, y + 5); doc.text("Date", W - M - 50, y + 5);

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(230, 234, 242); doc.setLineWidth(0.2); doc.line(M, 282, W - M, 282);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(107, 100, 120);
    doc.text("SafeHer AI hackathon demo — synthetic sample data. Not an official police document.", M, 287);
    doc.text(`Page ${p} of ${pages} · ${hash.slice(0, 16)}…`, W - M, 287, { align: "right" });
  }

  doc.save(`SafeHer-incident-report-${reportNo}.pdf`);
  return { reportNo, hash, pages };
}
