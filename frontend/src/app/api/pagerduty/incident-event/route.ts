export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLACK_WEBHOOK_ENV = "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL";
const LEGACY_SLACK_WEBHOOK_ENV = "SLACK_WEBHOOK_URL";
const WEBHOOK_SECRET_ENV = "PAGERDUTY_INCIDENT_WEBHOOK_SECRET";
const MAX_SLACK_TEXT_LENGTH = 3900;
const SECRET_PATTERNS = [
  /(Authorization:\s*Bearer\s+)[^\s'"`]+/gi,
  /(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi,
  /(api[_-]?key\s*[=:]\s*)[^\s'"`]+/gi,
  /(password\s*[=:]\s*)[^\s'"`]+/gi,
  /(token\s*[=:]\s*)[^\s'"`]+/gi,
  /(postgres(?:ql)?:\/\/)[^\s'"`]+/gi,
  /(mysql:\/\/)[^\s'"`]+/gi,
  /(redis:\/\/)[^\s'"`]+/gi,
  /(https:\/\/hooks\.slack\.com\/services\/)[^\s'"`]+/gi,
];

type IncidentSummary = {
  eventType: string;
  incidentId: string;
  title: string;
  status?: string;
  serviceName?: string;
  serviceId?: string;
  url?: string;
  occurredAt?: string;
};

type SlackPostResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(
  record: Record<string, unknown> | null | undefined,
  key: string
): string | undefined {
  if (!record) {
    return undefined;
  }
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function nestedRecord(
  record: Record<string, unknown> | null | undefined,
  key: string
): Record<string, unknown> | undefined {
  if (!record) {
    return undefined;
  }
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function firstPagerDutyMessage(payload: Record<string, unknown>): Record<string, unknown> {
  const messages = payload.messages;
  if (Array.isArray(messages) && isRecord(messages[0])) {
    return messages[0];
  }
  const event = payload.event;
  if (isRecord(event)) {
    return event;
  }
  return payload;
}

function triggerContext(payload: Record<string, unknown>): Record<string, unknown> {
  const context = nestedRecord(payload, "triggerContext");
  return context ?? payload;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
}

function redact(text: string | undefined): string | undefined {
  if (!text) {
    return undefined;
  }

  return SECRET_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, "$1[REDACTED]"),
    text
  );
}

function normalizeSummary(payload: unknown): IncidentSummary | null {
  if (!isRecord(payload)) {
    return null;
  }

  const context = triggerContext(payload);
  const message = firstPagerDutyMessage(context);
  const incident =
    nestedRecord(message, "incident") ??
    nestedRecord(message, "data") ??
    context;
  const service = nestedRecord(incident, "service");
  const webhook =
    nestedRecord(message, "webhook") ??
    nestedRecord(message, "webhook_event");

  const incidentId =
    getString(context, "pagerduty_incident_id") ??
    getString(incident, "id") ??
    getString(incident, "incident_key") ??
    "";
  const title = redact(
    getString(context, "pagerduty_incident_title") ??
      getString(incident, "title") ??
      getString(incident, "summary") ??
      "Untitled incident"
  )!;
  const eventType =
    getString(context, "pagerduty_event_type") ??
    getString(message, "event_type") ??
    getString(message, "event") ??
    getString(webhook, "type") ??
    "incident.event";

  if (!incidentId && title === "Untitled incident") {
    return null;
  }

  return {
    eventType,
    incidentId,
    title,
    status: redact(
      getString(context, "pagerduty_incident_status") ??
        getString(incident, "status")
    ),
    serviceName: redact(
      getString(context, "pagerduty_service_name") ??
        getString(service, "summary") ??
        getString(service, "name")
    ),
    serviceId:
      getString(context, "pagerduty_service_id") ?? getString(service, "id"),
    url:
      getString(context, "pagerduty_incident_url") ??
      getString(incident, "html_url") ??
      getString(incident, "self"),
    occurredAt:
      getString(message, "occurred_at") ??
      getString(context, "timestamp") ??
      getString(incident, "updated_at") ??
      getString(incident, "created_at"),
  };
}

function formatSlackSummary(summary: IncidentSummary): string {
  const lines = [
    `*PagerDuty incident event:* \`${summary.eventType}\``,
    `*Title:* ${summary.title}`,
    `*Incident ID:* \`${summary.incidentId || "unknown"}\``,
  ];

  if (summary.status) {
    lines.push(`*Status:* ${summary.status}`);
  }
  if (summary.serviceName || summary.serviceId) {
    lines.push(
      `*Service:* ${
        summary.serviceName ?? "Unknown service"
      }${summary.serviceId ? ` (\`${summary.serviceId}\`)` : ""}`
    );
  }
  if (summary.occurredAt) {
    lines.push(`*Occurred:* ${summary.occurredAt}`);
  }
  if (summary.url) {
    lines.push(`*PagerDuty:* <${summary.url}|Open incident>`);
  }

  return truncate(lines.join("\n"), MAX_SLACK_TEXT_LENGTH);
}

function getSlackWebhookUrl(): string | null {
  const configured =
    process.env[SLACK_WEBHOOK_ENV]?.trim() ??
    process.env[LEGACY_SLACK_WEBHOOK_ENV]?.trim();
  if (!configured) {
    return null;
  }

  try {
    const url = new URL(configured);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function isAuthorized(request: Request): boolean {
  const expected = process.env[WEBHOOK_SECRET_ENV]?.trim();
  if (!expected) {
    return true;
  }

  const provided =
    request.headers.get("x-pagerduty-webhook-secret") ??
    request.headers.get("x-incident-webhook-secret");
  return provided === expected;
}

async function postToSlack(text: string): Promise<SlackPostResult> {
  const webhookUrl = getSlackWebhookUrl();
  if (!webhookUrl) {
    return {
      ok: false,
      status: 503,
      message: `${SLACK_WEBHOOK_ENV} must be set to an HTTPS Slack webhook URL`,
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (response.ok) {
    return { ok: true };
  }

  return {
    ok: false,
    status: 502,
    message: `Slack webhook returned ${response.status}`,
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const summary = normalizeSummary(payload);
  if (!summary) {
    return Response.json(
      { error: "Payload does not include a PagerDuty incident" },
      { status: 400 }
    );
  }

  const text = formatSlackSummary(summary);
  const result = await postToSlack(text);
  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.status });
  }

  return Response.json({ ok: true });
}
