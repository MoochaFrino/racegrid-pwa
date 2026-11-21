export function downloadIcsForCircuits(
  circuits,
  filename = "racegrid-f1-2026.ics"
) {
  const toIcsDate = (iso) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const events = [];
  for (const c of circuits) {
    for (const s of c.sessions || []) {
      events.push(
        [
          "BEGIN:VEVENT",
          `UID:${c.slug}-${s.name.replace(/\s+/g, "-").toLowerCase()}@racegrid`,
          `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
          `DTSTART:${toIcsDate(s.start)}`,
          `DTEND:${toIcsDate(s.end || s.start)}`,
          `SUMMARY:${s.name} - ${c.gp_name}`,
          `LOCATION:${c.name}, ${c.city}, ${c.country}`,
          "END:VEVENT",
        ].join("\r\n")
      );
    }
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RaceGrid PWA//F1 2026 Schedule//EN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
