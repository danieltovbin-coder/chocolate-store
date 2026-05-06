import { describe, expect, it } from "vitest";

import {
  formatIncidentSlackMessage,
  isHighPriorityIncident,
} from "./incident-slack";

const baseIncident = {
  pagerduty_incident_id: "Q2K51AJOY9CW1E",
  pagerduty_incident_title: "[High] Chocolate checkout latency",
  pagerduty_incident_status: "triggered",
  pagerduty_service_id: "PTT828M",
  pagerduty_service_name: "Default Service",
  pagerduty_event_type: "incident.triggered",
  pagerduty_incident_url: "https://anina.pagerduty.com/incidents/Q2K51AJOY9CW1E",
};

describe("incident Slack notifications", () => {
  it("classifies high priority signals", () => {
    expect(isHighPriorityIncident(baseIncident)).toBe(true);
    expect(
      isHighPriorityIncident({
        ...baseIncident,
        pagerduty_incident_title: "Chocolate checkout latency",
        pagerduty_incident_priority: "P1",
      })
    ).toBe(true);
    expect(
      isHighPriorityIncident({
        ...baseIncident,
        pagerduty_incident_title: "Chocolate checkout latency",
        pagerduty_incident_urgency: "high",
      })
    ).toBe(true);
  });

  it("does not notify for medium priority incidents", () => {
    expect(
      isHighPriorityIncident({
        ...baseIncident,
        pagerduty_incident_title: "[Medium] Chocolate store seems slow today",
      })
    ).toBe(false);
  });

  it("formats and redacts the Slack summary", () => {
    const message = formatIncidentSlackMessage({
      ...baseIncident,
      pagerduty_incident_title:
        "[High] token=abc123 Chocolate checkout latency Authorization: Bearer secret-token",
    });

    expect(message).toContain("*High-priority PagerDuty incident event*");
    expect(message).toContain("*Event:* incident.triggered");
    expect(message).toContain("*Service:* Default Service (PTT828M)");
    expect(message).toContain("*Incident ID:* Q2K51AJOY9CW1E");
    expect(message).toContain("*Link:* https://anina.pagerduty.com/incidents/Q2K51AJOY9CW1E");
    expect(message).toContain("token=[REDACTED]");
    expect(message).toContain("Authorization: Bearer [REDACTED]");
    expect(message).not.toContain("secret-token");
  });
});
