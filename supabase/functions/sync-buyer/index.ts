import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface BuyerPayload {
  name: string;
  email: string;
  product_title: string;
  ref_id?: string;
  amount?: string;
}

function determineAccessType(productTitle: string): "basic" | "pro" | "ebook" | "mindcare" {
  const title = productTitle.toLowerCase();
  
  // Check for PRO access keywords
  if (
    title.includes("pro") ||
    title.includes("private") ||
    title.includes("upgrade")
  ) {
    return "pro";
  }
  
  // Check for EBOOK
  if (title.includes("ebook generator")) {
    return "ebook";
  }
  
  // Check for MINDCARE
  if (title.includes("mind care") || title.includes("mindcare")) {
    return "mindcare";
  }
  
  return "basic";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("BUYER_SYNC_WEBHOOK_SECRET");

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const payload: BuyerPayload = await req.json();
    console.log("Received payload:", JSON.stringify(payload));

    // Validate required fields
    if (!payload.email || !payload.name || !payload.product_title) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, product_title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine access type based on product title
    const accessType = determineAccessType(payload.product_title);
    console.log(`Determined access type: ${accessType} for product: ${payload.product_title}`);

    // Upsert buyer data (update if email exists, insert if not)
    const { data, error } = await supabase
      .from("buyers")
      .upsert(
        {
          name: payload.name.trim(),
          email: payload.email.toLowerCase().trim(),
          product_title: payload.product_title,
          access_type: accessType,
          ref_id: payload.ref_id || null,
          amount: payload.amount || null,
          purchased_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save buyer data", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Buyer synced successfully:", data);
    return new Response(
      JSON.stringify({ success: true, buyer: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
