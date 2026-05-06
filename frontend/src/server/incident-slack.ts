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

function slackText(text: string): string {
  return redacted(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
  const normalizedSignals = incident.prioritySignals.map(normalizeSignal);

  if (normalizedSignals.some((signal) => HIGH_PRIORITY_VALUES.has(signal))) {
    return true;
  }

  return false;
}

export function formatIncidentSlackMessage(input: IncidentNotificationInput): string {
  const incident = normalizeIncident(input);
  const lines = [
    "*High-priority PagerDuty incident event*",
    `*Event:* ${slackText(incident.eventType || "unknown")}`,
    `*Incident:* ${slackText(incident.title || "Untitled incident")}`,
    `*Status:* ${slackText(incident.status || "unknown")}`,
    `*Service:* ${slackText(incident.serviceName || "unknown")}${incident.serviceId ? ` (${slackText(incident.serviceId)})` : ""}`,
  ];

  if (incident.prioritySignals.length > 0) {
    lines.push(`*Priority signal:* ${slackText(incident.prioritySignals.join(", "))}`);
  }
  if (incident.id) {
    lines.push(`*Incident ID:* ${slackText(incident.id)}`);
  }
  if (incident.url) {
    lines.push(`*Link:* ${slackText(incident.url)}`);
  }

  return lines.join("\n");
}

