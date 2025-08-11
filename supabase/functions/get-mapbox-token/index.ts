// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const token = Deno.env.get("MAPBOX_PUBLIC_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing MAPBOX_PUBLIC_TOKEN" }), {
        status: 500,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      });
    }

    return new Response(JSON.stringify({ token }), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  }
});
