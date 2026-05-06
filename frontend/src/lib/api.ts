import type { CheckoutPayload, CheckoutResponse, Candy } from "@/lib/types";

const base = () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function fetchCandies(params?: {
  tags?: string[];
  sort?: string;
}): Promise<Candy[]> {
  const u = new URL("/api/candies", base());
  if (params?.tags?.length) {
    for (const t of params.tags) {
      if (t) u.searchParams.append("tag", t);
    }
  }
  if (params?.sort) u.searchParams.set("sort", params.sort);
  const res = await fetch(u.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load candies");
  return res.json() as Promise<Candy[]>;
}

export async function fetchCandy(id: string): Promise<Candy> {
  const res = await fetch(`${base()}/api/candies/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) throw new Error("Not found");
  if (!res.ok) throw new Error("Failed to load candy");
  return res.json() as Promise<Candy>;
}

export async function postCheckout(
  body: CheckoutPayload
): Promise<CheckoutResponse> {
  const res = await fetch(`${base()}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    let msg = `Checkout failed (${res.status})`;
    if (typeof err.detail === "string") msg = err.detail;
    if (Array.isArray(err.detail)) {
      const parts = err.detail.map(
        (d: { msg?: string }) => (typeof d === "string" ? d : d?.msg) ?? ""
      );
      if (parts.some(Boolean)) msg = parts.join(" · ");
    }
    throw new Error(msg);
  }
  return res.json() as Promise<CheckoutResponse>;
}
