"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Gift, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CREDITS_TIERS } from "@/config/subscriptions";

interface ChineseNamePricingProps {
  onScrollToForm?: () => void;
}

const tierIcons = [
  <Zap key="basic" className="h-6 w-6" />,
  <Crown key="standard" className="h-6 w-6" />,
  <Sparkles key="premium" className="h-6 w-6" />,
];

export default function ChineseNamePricing({ onScrollToForm }: ChineseNamePricingProps) {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleFreeTrialClick = () => {
    if (onScrollToForm) {
      onScrollToForm();
    } else {
      const formSection = document.querySelector('[data-name-generator-form]');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePurchase = async (tierId: string, creditAmount: number) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive",
      });
      router.push('/sign-in');
      return;
    }

    setIsProcessing(tierId);

    try {
      const response = await fetch('/api/creem/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'chinese-name-credits',
          quantity: creditAmount,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section id="chinese-name-pricing" className="w-full py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Choose Your Plan
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Start with a free trial or pick a credit package for Chinese name generation
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid gap-8 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Free Trial Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg border border-border hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-muted">
                      <div className="text-muted-foreground">
                        <Gift className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-foreground">
                    Free Trial
                  </CardTitle>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-foreground">$0</span>
                    </div>
                    <p className="text-muted-foreground">
                      Perfect for trying out our service
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {[
                      "1 free name generation",
                      "Basic name analysis",
                      "Cultural significance",
                      "Pinyin pronunciation",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1 rounded-full bg-muted">
                          <Check className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleFreeTrialClick}
                      variant="outline"
                      className="w-full h-12 text-lg font-medium transition-all duration-200 border-primary/20 text-primary hover:bg-primary/5"
                    >
                      Try Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Credit Tier Cards from config */}
            {CREDITS_TIERS.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                className="relative"
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                  tier.featured
                    ? 'border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10'
                    : 'border border-border hover:border-primary/20'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        tier.featured ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <div className={tier.featured ? 'text-primary' : 'text-muted-foreground'}>
                          {tierIcons[index] || tierIcons[0]}
                        </div>
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-foreground">
                      {tier.name}
                    </CardTitle>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-foreground">
                          {tier.priceMonthly}
                        </span>
                        <span className="text-muted-foreground text-lg">
                          / {tier.creditAmount} credits
                        </span>
                      </div>

                      <p className="text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {(tier.features || []).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full ${
                            tier.featured ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <Check className={`h-3 w-3 ${
                              tier.featured ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <span className="text-muted-foreground text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => handlePurchase(tier.id, tier.creditAmount || 0)}
                        disabled={isProcessing === tier.id}
                        variant={tier.featured ? "default" : "outline"}
                        className={`w-full h-12 text-lg font-medium transition-all duration-200 ${
                          tier.featured
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'border-primary/20 text-primary hover:bg-primary/5'
                        }`}
                      >
                        {isProcessing === tier.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          "Purchase"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center space-y-4 pt-8"
          >
            <h3 className="text-xl font-semibold text-foreground">
              Questions about pricing?
            </h3>
            <p className="text-muted-foreground">
              Credits never expire and can be used for both Standard (1 credit) and Premium (4 credits) generations.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Secure payments
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Instant credit delivery
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                24/7 support
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Money-back guarantee
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
