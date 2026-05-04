# Send Incident Summary

When a PagerDuty incident event triggers this automation, send a concise Slack summary of the event to `#mu`.

## Destination

Use the built-in `SendSlackMessage` tool. It posts to `#mu` (`C0B16DGJ5SR`).

## Event Source

Use only the fields provided in `automation_trigger_info.triggerContext` for the summary. Do not infer operational details from workspace files, git history, terminal output, or environment variables.

Expected fields include:

- `pagerduty_event_type`
- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_service_id`
- `pagerduty_service_name`
- `pagerduty_incident_url`

If a field is missing, omit that line rather than guessing.

## Slack Message

Format the message as short labeled lines:

```text
*PagerDuty incident event: `<pagerduty_event_type>`*

*Incident:* [<pagerduty_incident_id>](<pagerduty_incident_url>)
*Title:* <pagerduty_incident_title>
*Status:* <pagerduty_incident_status>
*Service:* <pagerduty_service_name> (`<pagerduty_service_id>`)
*PagerDuty incident ID:* `<pagerduty_incident_id>`
```

Keep the message under Slack limits. Redact obvious secrets if any event field contains tokens, passwords, authorization headers, or long opaque credentials.
