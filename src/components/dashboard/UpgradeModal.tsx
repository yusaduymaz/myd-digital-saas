"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "./DashboardContext";
import type { SubscriptionPlan } from "@/lib/supabase/types";
import { PLAN_LIMITS } from "@/lib/supabase/types";

interface UpgradeModalProps {
  currentPlan: SubscriptionPlan;
}

const planDetails = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
  },
  pro: {
    name: "Pro",
    price: "$49",
    period: "per month",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
  },
};

export function UpgradeModal({ currentPlan }: UpgradeModalProps) {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeReason } = useDashboard();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("pro");
  const [isLoading, setIsLoading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Here you would integrate with Stripe checkout
    // For now, we'll simulate a redirect
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.location.href = `/checkout?plan=${selectedPlan}`;
  };

  const plans: SubscriptionPlan[] = ["free", "pro", "enterprise"];
  const upgradablePlans = plans.filter((p) => {
    const order = { free: 0, pro: 1, enterprise: 2 };
    return order[p] > order[currentPlan];
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeUpgradeModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-surface-container rounded-2xl border border-outline-variant/20 shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-primary-container">
                rocket_launch
              </span>
            </div>
            <h2 className="text-2xl font-bold font-headline text-white mb-2">
              Upgrade Your Plan
            </h2>
            {upgradeReason && (
              <p className="text-gray-400">{upgradeReason}</p>
            )}
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {upgradablePlans.map((plan) => {
              const details = planDetails[plan];
              const limits = PLAN_LIMITS[plan];
              const isSelected = selectedPlan === plan;

              return (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary-container bg-primary-container/10"
                      : "border-outline-variant/20 bg-surface hover:border-outline-variant/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-headline">
                        {details.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary-container">
                          {details.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          {details.period}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-primary-container bg-primary-container"
                          : "border-gray-500"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-on-primary-container text-sm">
                          check
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-primary-container text-base">
                        check
                      </span>
                      {limits.max_users === -1
                        ? "Unlimited users"
                        : `Up to ${limits.max_users} users`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-primary-container text-base">
                        check
                      </span>
                      {limits.max_projects === -1
                        ? "Unlimited projects"
                        : `${limits.max_projects} projects`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="material-symbols-outlined text-primary-container text-base">
                        check
                      </span>
                      {limits.api_calls_per_month === -1
                        ? "Unlimited API calls"
                        : `${limits.api_calls_per_month.toLocaleString()} API calls/mo`}
                    </li>
                    {limits.features.includes("advanced_reports") && (
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="material-symbols-outlined text-primary-container text-base">
                          check
                        </span>
                        Advanced reports
                      </li>
                    )}
                    {limits.features.includes("priority_support") && (
                      <li className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="material-symbols-outlined text-primary-container text-base">
                          check
                        </span>
                        Priority support
                      </li>
                    )}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpgrade}
              disabled={isLoading || selectedPlan === "enterprise"}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Processing...
                </>
              ) : selectedPlan === "enterprise" ? (
                <>Contact Sales</>
              ) : (
                <>
                  Upgrade to {planDetails[selectedPlan].name}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
            <button
              onClick={closeUpgradeModal}
              className="px-6 py-3 rounded-lg font-label font-medium border border-outline-variant/30 text-gray-400 hover:text-white hover:bg-surface-container transition-all"
            >
              Maybe Later
            </button>
          </div>

          {/* Enterprise CTA */}
          {selectedPlan === "enterprise" && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link href="/contact" className="text-primary-container hover:underline">
                Contact our sales team
              </Link>{" "}
              for custom Enterprise pricing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
