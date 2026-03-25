import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ShipmentStatusPayload {
  shipment_id: string;
  new_status: string;
  old_status?: string;
  updated_by?: string;
  notes?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload: ShipmentStatusPayload = await req.json();
    const { shipment_id, new_status, old_status, updated_by, notes } = payload;

    if (!shipment_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "shipment_id and new_status are required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const { data: shipment, error: updateError } = await supabase
      .from("shipments")
      .update({ status: new_status, updated_at: new Date().toISOString() })
      .eq("id", shipment_id)
      .select("id, cn_number, consignor_name, consignee_name, org_id")
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("tracking_events").insert({
      shipment_id, status: new_status,
      notes: notes ?? `Status changed from ${old_status ?? "unknown"} to ${new_status}`,
      org_id: shipment.org_id, created_by_staff_id: updated_by ?? null,
    });

    await supabase.from("audit_logs").insert({
      entity_type: "shipment", entity_id: shipment_id, action: "STATUS_CHANGE",
      before_data: { status: old_status }, after_data: { status: new_status },
      actor_staff_id: updated_by ?? null, org_id: shipment.org_id,
    });

    if (new_status === "EXCEPTION") {
      await supabase.from("exceptions").insert({
        shipment_id, type: "STATUS_EXCEPTION", severity: "HIGH",
        description: notes ?? "Shipment marked as exception",
        status: "OPEN", reported_by_staff_id: updated_by ?? null, org_id: shipment.org_id,
      });
    }

    return new Response(
      JSON.stringify({ success: true, shipment: { id: shipment.id, cn_number: shipment.cn_number, new_status, old_status } }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
