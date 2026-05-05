# Summarize PagerDuty incident event

When a PagerDuty incident event triggers this automation, post a concise Slack
summary of the event to `#mu`.

## Slack destination

Use the automation Slack action for `#mu` (channel `C0B16DGJ5SR`).

## Input

Use only the `automation_trigger_info.triggerContext` payload supplied by the
automation. Do not infer incident details from repository files, terminals, git
history, or environment variables.

Expected trigger fields may include:

- `pagerduty_event_type`
- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_service_id`
- `pagerduty_service_name`
- `pagerduty_incident_url`

## Message format

Send a structured Slack message under roughly 4000 characters:

```text
*PagerDuty incident event summary*
- *Event:* `<pagerduty_event_type>`
- *Incident:* <pagerduty_incident_title>
- *Status:* <pagerduty_incident_status>
- *Service:* <pagerduty_service_name> (`<pagerduty_service_id>`)
- *Incident ID:* `<pagerduty_incident_id>`
- *PagerDuty:* <pagerduty_incident_url>
```

Omit fields that are absent from the trigger payload. Include the automation id
and trigger timestamp when they are available.

## Security

Before posting, redact secrets in any text field to `[REDACTED]`, including API
tokens, passwords, private keys, cookies, authorization headers, database
connection strings, webhook URLs with embedded secrets, and long opaque values.
