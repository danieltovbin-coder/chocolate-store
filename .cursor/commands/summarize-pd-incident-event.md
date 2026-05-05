# Summarize PagerDuty incident event

When a PagerDuty incident automation runs, post a concise summary of the event to
Slack channel `#mu`.

## Input

Use the `automation_trigger_info.triggerContext` fields from the automation run.
Do not infer extra incident facts from the repository, terminals, git history, or
workspace files.

Expected fields include:

- `pagerduty_event_type`
- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_incident_url`
- `pagerduty_service_id`
- `pagerduty_service_name`

## Slack Destination

Post to `#mu` using the automation Slack action.

## Message Format

Keep the summary short and structured:

```text
*PagerDuty incident event: <event type or "unknown">*
- *Incident:* <title or "Untitled incident">
- *Status:* <status or "unknown">
- *Service:* <service name or "unknown"> (`<service id or unknown>`)
- *Incident ID:* `<incident id or unknown>`
- *Event type:* `<event type or unknown>`
- *Link:* <incident URL if present>
- *Reported at:* <automation timestamp in UTC if known>
```

If an optional value is missing, include `unknown` rather than guessing. If the
incident URL is missing, omit the link line.

## Security

Before posting, redact obvious secrets from every string sent to Slack:

- API keys, bearer tokens, passwords, cookies, private keys, database connection
  strings, and webhook URLs with embedded secrets
- Long opaque secret-like strings
- Full stack traces

Use `[REDACTED]` for replacements. Do not add operational details that were not
present in the trigger payload.
