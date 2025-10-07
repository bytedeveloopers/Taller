// src/lib/api-proxy.ts
export const dynamic = "force-dynamic";

type ProxyInit = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: HeadersInit;
  body?: any;
  searchParams?: URLSearchParams | Record<string, string | undefined>;
  timeoutMs?: number;
};

function buildUrl(path: string, searchParams?: ProxyInit["searchParams"]) {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  // ⚠️ No lanzamos error: devolvemos null y lo manejamos arriba
  if (!base) return null;

  const url = new URL(`${base}${path.startsWith("/") ? "" : "/"}${path}`);

  if (searchParams) {
    const sp =
      searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams();
    if (!(searchParams instanceof URLSearchParams)) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) sp.set(k, String(v));
      });
    }
    sp.forEach((v, k) => url.searchParams.set(k, v));
  }

  return url.toString();
}

export async function proxyJson(
  path: string,
  req: Request,
  init: ProxyInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 30000);

  try {
    const upstreamUrl = buildUrl(path, init.searchParams);
    if (!upstreamUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "BACKEND_URL no está definido en .env.local" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const auth = req.headers.get("authorization") || "";
    const headers: HeadersInit = {
      "content-type": "application/json",
      ...(auth ? { authorization: auth } : {}),
      ...(init.headers || {}),
    };

    const res = await fetch(upstreamUrl, {
      method: init.method ?? "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
      body:
        init.body !== undefined && init.body !== null
          ? typeof init.body === "string"
            ? init.body
            : JSON.stringify(init.body)
          : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    } else {
      const txt = await res.text().catch(() => "");
      return new Response(txt, {
        status: res.status,
        headers: { "content-type": contentType || "text/plain" },
      });
    }
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Upstream timeout" : String(err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
}
