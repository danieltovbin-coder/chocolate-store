import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const REQUEST_URL = "http://localhost/api/incidents/slack";

function makeRequest(body: unknown): Request {
  return new Request(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/incidents/slack", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("skips non-high-priority incident events", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({
        triggerContext: {
          pagerduty_incident_title: "[Medium] Chocolate store seems slow today",
          pagerduty_incident_status: "resolved",
          pagerduty_event_type: "incident.resolved",
        },
      })
    );

    await expect(response.json()).resolves.toEqual({
      notified: false,
      reason: "Incident event was not classified as high priority",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a Slack summary for high-priority incident events", async () => {
    vi.stubEnv("INCIDENT_SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/test");
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({
        triggerContext: {
          pagerduty_incident_id: "Q2K51AJOY9CW1E",
          pagerduty_incident_title: "[High] Chocolate checkout latency",
          pagerduty_incident_status: "triggered",
          pagerduty_service_id: "PTT828M",
          pagerduty_service_name: "Default Service",
          pagerduty_event_type: "incident.triggered",
          pagerduty_incident_url: "https://anina.pagerduty.com/incidents/Q2K51AJOY9CW1E",
        },
      })
    );

    await expect(response.json()).resolves.toEqual({ notified: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Chocolate checkout latency"),
      })
    );
  });

  it("returns a configuration error before posting high-priority events", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({
        pagerduty_incident_title: "[Critical] Checkout is down",
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "INCIDENT_SLACK_WEBHOOK_URL or SLACK_WEBHOOK_URL must be set for high-priority incident notifications",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
