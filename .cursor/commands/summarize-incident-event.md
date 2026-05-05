# Summarize incident event

When an automation run is triggered by **any PagerDuty incident event**, send a concise Slack summary to **#mu**.

## Slack destination

Post to **#mu** using the available `SendSlackMessage` tool.

- Channel: `#mu`
- Channel id: `C0B16DGJ5SR`
- Use `is_final_message: false` if more automation work will continue after the post; otherwise omit it or set it to `true`.

## Source of truth

Use the automation trigger payload as the source for the event summary. The expected fields are under `triggerContext`, for example:

- `pagerduty_event_type`
- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_service_id`
- `pagerduty_service_name`
- `pagerduty_incident_url`

Do not infer incident facts from workspace files, git history, terminals, or unrelated application code. If a field is absent, omit that line or write `unknown`; do not guess.

## Message format

Keep the Slack post short and structured:

```text
*PagerDuty incident event received*

*Event:* `<pagerduty_event_type>`
*Incident:* <pagerduty_incident_title>
*Status:* `<pagerduty_incident_status>`
*Incident ID:* `<pagerduty_incident_id>`
*Service:* <pagerduty_service_name> (`<pagerduty_service_id>`)
*PagerDuty:* <pagerduty_incident_url>
```

## Security

Before posting, redact secrets from all outbound strings:

- API keys, tokens, passwords, cookies, and `Authorization` / `Bearer` values
- Database URLs and webhook URLs with embedded secrets
- Long opaque values that look like credentials
- Full stack traces or internal filesystem paths

If redaction removes the meaning of the event, post only the safe PagerDuty metadata that remains.

## Completion

After sending the Slack post, summarize that the incident event was posted to `#mu`, including the event type, incident id, and Slack thread timestamp if the tool returns one.
