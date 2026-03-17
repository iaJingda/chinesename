import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createCheckoutSession } from "@/app/actions";
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

    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the matching credit tier based on quantity or use the first one
    const creditTier = CREDITS_TIERS.find(
      (t) => t.creditAmount === quantity
    ) || CREDITS_TIERS[0];

    const checkoutUrl = await createCheckoutSession(
      creditTier.productId,
      user.email || "",
      user.id,
      productType === "chinese-name-credits" ? "credits" : "subscription",
      creditTier.creditAmount,
      creditTier.discountCode || undefined
    );

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
