export type IncidentNotificationInput = {
  pagerduty_incident_id?: unknown;
  pagerduty_incident_title?: unknown;
  pagerduty_incident_status?: unknown;
  pagerduty_service_id?: unknown;
  pagerduty_service_name?: unknown;
  pagerduty_event_type?: unknown;
  pagerduty_incident_url?: unknown;
  pagerduty_incident_urgency?: unknown;
  pagerduty_incident_priority?: unknown;
  pagerduty_incident_priority_name?: unknown;
  pagerduty_incident_severity?: unknown;
};

type NormalizedIncident = {
  id: string;
  title: string;
  status: string;
  serviceId: string;
  serviceName: string;
  eventType: string;
  url: string;
  prioritySignals: string[];
};

const HIGH_PRIORITY_VALUES = new Set([
  "high",
  "critical",
  "crit",
  "sev0",
  "sev1",
  "severity 0",
  "severity 1",
  "p0",
  "p1",
  "urgent",
]);

const LOW_PRIORITY_VALUES = new Set([
  "low",
  "medium",
  "moderate",
  "normal",
  "info",
  "informational",
  "sev2",
  "sev3",
  "sev4",
  "severity 2",
  "severity 3",
  "severity 4",
  "p2",
  "p3",
  "p4",
  "p5",
]);

function stringValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return (
      stringValue(record.summary) ||
      stringValue(record.name) ||
      stringValue(record.id)
    );
  }
  return "";
}

function redacted(text: string): string {
  return text
    .replace(/(authorization\s*:\s*bearer\s+)[^\s,;]+/gi, "$1[REDACTED]")
    .replace(/\b(bearer|token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .replace(/https:\/\/hooks\.slack\.com\/services\/[^\s)]+/gi, "https://hooks.slack.com/services/[REDACTED]")
    .replace(/[A-Za-z0-9+/]{48,}={0,2}/g, "[REDACTED]");
}

function normalizeSignal(signal: string): string {
  return signal
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function titleBracketSignal(title: string): string {
  const match = /^\s*\[([^\]]+)\]/.exec(title);
  return match ? match[1] ?? "" : "";
}

export function normalizeIncident(input: IncidentNotificationInput): NormalizedIncident {
  const title = stringValue(input.pagerduty_incident_title);
  const prioritySignals = [
    stringValue(input.pagerduty_incident_urgency),
    stringValue(input.pagerduty_incident_priority),
    stringValue(input.pagerduty_incident_priority_name),
    stringValue(input.pagerduty_incident_severity),
    titleBracketSignal(title),
  ].filter((signal) => signal.length > 0);

  return {
    id: stringValue(input.pagerduty_incident_id),
    title,
    status: stringValue(input.pagerduty_incident_status),
    serviceId: stringValue(input.pagerduty_service_id),
    serviceName: stringValue(input.pagerduty_service_name),
    eventType: stringValue(input.pagerduty_event_type),
    url: stringValue(input.pagerduty_incident_url),
    prioritySignals,
  };
}

export function isHighPriorityIncident(input: IncidentNotificationInput): boolean {
  const incident = normalizeIncident(input);

  for (const rawSignal of incident.prioritySignals) {
    const signal = normalizeSignal(rawSignal);
    if (HIGH_PRIORITY_VALUES.has(signal)) {
      return true;
    }
    if (LOW_PRIORITY_VALUES.has(signal)) {
      return false;
    }
  }

  return false;
}

export function formatIncidentSlackMessage(input: IncidentNotificationInput): string {
  const incident = normalizeIncident(input);
  const lines = [
    "*High-priority PagerDuty incident event*",
    `*Event:* ${redacted(incident.eventType || "unknown")}`,
    `*Incident:* ${redacted(incident.title || "Untitled incident")}`,
    `*Status:* ${redacted(incident.status || "unknown")}`,
    `*Service:* ${redacted(incident.serviceName || "unknown")}${incident.serviceId ? ` (${redacted(incident.serviceId)})` : ""}`,
  ];

  if (incident.prioritySignals.length > 0) {
    lines.push(`*Priority signal:* ${redacted(incident.prioritySignals.join(", "))}`);
  }
  if (incident.id) {
    lines.push(`*Incident ID:* ${redacted(incident.id)}`);
  }
  if (incident.url) {
    lines.push(`*Link:* ${redacted(incident.url)}`);
  }

  return lines.join("\n");
}

