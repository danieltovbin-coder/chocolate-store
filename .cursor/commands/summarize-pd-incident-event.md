# Summarize PagerDuty incident event

Summarize a high-priority PagerDuty incident automation event and send it to Slack.

## Trigger context

Use the `automation_trigger_info.triggerContext` object as the primary event source. Expected fields include:

- `pagerduty_incident_id`
- `pagerduty_incident_title`
- `pagerduty_incident_status`
- `pagerduty_service_id`
- `pagerduty_service_name`
- `pagerduty_event_type`
- `pagerduty_incident_url`
- `pagerduty_incident_priority`, `pagerduty_incident_urgency`, or equivalent priority fields when the trigger provides them

If the trigger context does not include priority or urgency, use live PagerDuty incident data when a PagerDuty MCP read tool is available. If neither source exposes priority, do not guess; say priority was unavailable.

## When to notify

Only send the Slack event summary when the incident is high priority.

Treat an incident as high priority when any trigger or live PagerDuty field clearly indicates one of:

- Priority: `P1`, `P2`, `high`, `critical`, `sev1`, `sev2`, `severity-1`, or `severity-2`
- Urgency: `high`

If the event is not high priority, do not post to Slack. Reply with a brief skipped-notification note that includes the observed priority or urgency.

## Slack destination

Post the summary using the available Slack messaging tool for this automation.

When using Slack text:

- Keep the message under about 4000 characters.
- Prefer short labeled lines over prose.
- Include a PagerDuty link when available.
- Redact obvious secrets from titles, summaries, notes, and URLs before sending.

## Summary content

Include these fields when available:

- Event type
- Incident title
- Incident status
- Priority or urgency
- Service name and id
- Incident id
- PagerDuty URL
- Report timestamp in UTC

For resolved incidents, lead with the resolved status. For triggered or acknowledged incidents, lead with the current status and priority.

## Message template

```text
PagerDuty incident event: <status>

Title: <title>
Priority/Urgency: <priority-or-urgency>
Event: <event-type>
Service: <service-name> (<service-id>)
Incident: <incident-id>
Link: <pagerduty-url>
Reported: <timestamp-utc>
```

## Constraints

- Do not invent priority, urgency, timestamps, or incident facts.
- Do not print API tokens or MCP headers.
- Do not post low-priority or unknown-priority incidents as high priority.
