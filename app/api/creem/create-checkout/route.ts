import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CREDITS_TIERS } from "@/config/subscriptions";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productType, quantity, userId } = body;

    console.log("Create checkout request:", { productType, quantity, userId });

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the matching credit tier based on quantity or use the first one
    const creditTier = CREDITS_TIERS.find(
      (t) => t.creditAmount === quantity
    ) || CREDITS_TIERS[0];

    console.log("Selected credit tier:", {
      name: creditTier.name,
      productId: creditTier.productId,
      creditAmount: creditTier.creditAmount,
    });

    const creemApiUrl = process.env.CREEM_API_URL;
    const creemApiKey = process.env.CREEM_API_KEY;

    if (!creemApiUrl || !creemApiKey) {
      console.error("Missing Creem config:", {
        hasApiUrl: !!creemApiUrl,
        hasApiKey: !!creemApiKey,
      });
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const requestBody: Record<string, unknown> = {
      product_id: creditTier.productId,
      customer: {
        email: user.email || "",
      },
      metadata: {
        user_id: user.id,
        product_type:
          productType === "chinese-name-credits" ? "credits" : "subscription",
        credits: creditTier.creditAmount || 0,
      },
    };

    if (process.env.CREEM_SUCCESS_URL) {
      requestBody.success_url = process.env.CREEM_SUCCESS_URL;
    }

    if (creditTier.discountCode) {
      requestBody.discount_code = creditTier.discountCode;
    }

    console.log("Creem API request:", {
      url: `${creemApiUrl}/checkouts`,
      body: requestBody,
    });

    const response = await fetch(`${creemApiUrl}/checkouts`, {
      method: "POST",
      headers: {
        "x-api-key": creemApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("Creem API response:", {
      status: response.status,
      body: responseText,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Creem API error", details: responseText },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);
    return NextResponse.json({ checkoutUrl: data.checkout_url });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
