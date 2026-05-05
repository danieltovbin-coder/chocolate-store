import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const REQUEST_URL = "http://localhost/api/pagerduty/incident-event";

function makeRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function pdEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: {
      event_type: "incident.resolved",
      occurred_at: "2026-05-05T12:57:00Z",
      data: {
        id: "Q31FS0I0CLW0ZD",
        title: "Application is very slow today",
        html_url: "https://anina.pagerduty.com/incidents/Q31FS0I0CLW0ZD",
        status: "resolved",
        service: {
          id: "PTT828M",
          summary: "Default Service",
        },
      },
      ...overrides,
    },
  };
}

describe("POST /api/pagerduty/incident-event", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("posts a Slack summary for a PagerDuty incident event", async () => {
    vi.stubEnv(
      "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL",
      "https://hooks.slack.com/services/test"
    );
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(makeRequest(pdEvent()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    const [, init] = fetchMock.mock.calls[0]!;
    const payload = JSON.parse(String(init?.body)) as { text: string };
    expect(payload.text).toContain("*PagerDuty incident event:* `incident.resolved`");
    expect(payload.text).toContain("*Title:* Application is very slow today");
    expect(payload.text).toContain("*Status:* resolved");
    expect(payload.text).toContain("*Service:* Default Service (`PTT828M`)");
    expect(payload.text).toContain(
      "*PagerDuty:* <https://anina.pagerduty.com/incidents/Q31FS0I0CLW0ZD|Open incident>"
    );
  });

  it("accepts automation trigger context payloads", async () => {
    vi.stubEnv(
      "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL",
      "https://hooks.slack.com/services/test"
    );
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest({
        triggerContext: {
          pagerduty_event_type: "incident.resolved",
          pagerduty_incident_id: "Q31FS0I0CLW0ZD",
          pagerduty_incident_title: "Application is very slow today",
          pagerduty_incident_status: "resolved",
          pagerduty_service_id: "PTT828M",
          pagerduty_service_name: "Default Service",
          pagerduty_incident_url:
            "https://anina.pagerduty.com/incidents/Q31FS0I0CLW0ZD",
        },
      })
    );

    const [, init] = fetchMock.mock.calls[0]!;
    const payload = JSON.parse(String(init?.body)) as { text: string };

    expect(response.status).toBe(200);
    expect(payload.text).toContain("*PagerDuty incident event:* `incident.resolved`");
    expect(payload.text).toContain("*Incident ID:* `Q31FS0I0CLW0ZD`");
  });

  it("requires the configured webhook secret when set", async () => {
    vi.stubEnv(
      "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL",
      "https://hooks.slack.com/services/test"
    );
    vi.stubEnv("PAGERDUTY_INCIDENT_WEBHOOK_SECRET", "secret-value");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      makeRequest(pdEvent(), { "x-pagerduty-webhook-secret": "wrong" })
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redacts secrets before posting to Slack", async () => {
    vi.stubEnv(
      "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL",
      "https://hooks.slack.com/services/test"
    );
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await POST(
      makeRequest(
        pdEvent({
          data: {
            id: "PSECRET",
            title: "Checkout failed Authorization: Bearer abc123secret",
            status: "triggered",
          },
        })
      )
    );

    const [, init] = fetchMock.mock.calls[0]!;
    const payload = JSON.parse(String(init?.body)) as { text: string };

    expect(payload.text).toContain("Checkout failed Authorization: Bearer [REDACTED]");
    expect(payload.text).not.toContain("abc123secret");
  });

  it("returns an error when Slack rejects the webhook post", async () => {
    vi.stubEnv(
      "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL",
      "https://hooks.slack.com/services/test"
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500, statusText: "Server Error" }))
    );

    const response = await POST(makeRequest(pdEvent()));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: "Slack webhook returned 500" });
  });

  it("returns an error when the Slack webhook URL is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(makeRequest(pdEvent()));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      error:
        "SLACK_INCIDENT_SUMMARY_WEBHOOK_URL must be set to an HTTPS Slack webhook URL",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
