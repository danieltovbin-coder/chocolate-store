# Summarize incident event

When a PagerDuty incident event triggers this automation, send a concise Slack summary to `#mu`.

## Slack destination

Use the automation-provided Slack sender for `#mu`. Do not post to other channels unless the user explicitly asks for a different destination.

## Source of truth

Use the event payload provided in the automation trigger as the primary source. Expected fields may include:

- `pagerduty_event_type`
- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_service_id`
- `pagerduty_service_name`
- `pagerduty_incident_url`

Do not invent missing PagerDuty fields. If a field is absent, omit it or mark it as unavailable. Do not use workspace files, git history, terminals, environment variables, or cached MCP data to fabricate incident details.

## Message format

Keep the Slack message short, factual, and under 4000 characters. Include:

- A lead line identifying the PagerDuty event type and incident title.
- Incident ID.
- Current status.
- Service name and service ID when present.
- PagerDuty incident link when present.
- Event received timestamp in UTC.

Example:

```text
PagerDuty incident event: incident.resolved
Incident: Chocolate store is slow today (Q3TGT6PWRLL15Y)
Status: resolved
Service: Default Service (PTT828M)
Link: https://anina.pagerduty.com/incidents/Q3TGT6PWRLL15Y
Received: 2026-05-06T15:08:00Z
```

## Security

Before posting, redact obvious secrets in any free-text fields, including API tokens, bearer tokens, passwords, cookies, private keys, database URLs, webhook URLs with embedded tokens, and long opaque secret-looking strings. Replace redacted content with `[REDACTED]`.

## Execution

1. Read the automation trigger payload.
2. Build the Slack summary from the payload fields.
3. Send the message to `#mu`.
4. Reply with a brief confirmation that includes the incident ID, event type, and whether Slack posting succeeded.
