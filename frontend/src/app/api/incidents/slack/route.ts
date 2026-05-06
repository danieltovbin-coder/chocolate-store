import {
  formatIncidentSlackMessage,
  isHighPriorityIncident,
  type IncidentNotificationInput,
} from "@/server/incident-slack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncidentNotificationBody = {
  triggerContext?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function incidentInputFromBody(body: unknown): IncidentNotificationInput | null {
  const record = asRecord(body);
  if (!record) {
    return null;
  }

  const maybeWrapped = record as IncidentNotificationBody;
  const triggerContext = asRecord(maybeWrapped.triggerContext);
  return (triggerContext ?? record) as IncidentNotificationInput;
}

function slackWebhookUrl(): string {
  return (
    process.env.INCIDENT_SLACK_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim() ||
    ""
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = incidentInputFromBody(body);
  if (!input) {
    return Response.json({ error: "Expected an incident event object" }, { status: 400 });
  }

  if (!isHighPriorityIncident(input)) {
    return Response.json({
      notified: false,
      reason: "Incident event was not classified as high priority",
    });
  }

  const webhookUrl = slackWebhookUrl();
  if (!webhookUrl) {
    return Response.json(
      {
        error:
          "INCIDENT_SLACK_WEBHOOK_URL or SLACK_WEBHOOK_URL must be set for high-priority incident notifications",
      },
      { status: 503 }
    );
  }

  const message = formatIncidentSlackMessage(input);
  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch {
    return Response.json(
      { error: "Slack notification failed" },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return Response.json(
      { error: "Slack notification failed" },
      { status: 502 }
    );
  }

  return Response.json({ notified: true });
}
