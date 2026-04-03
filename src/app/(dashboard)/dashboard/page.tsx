"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUser, useOrganization, useSubscription } from "@/lib/supabase";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardContext";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import type { SubscriptionPlan } from "@/lib/supabase/types";

function PrimaryActionSection() {
  const { executeAction, isExecutingAction } = useDashboard();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setMessage(null);
    setError(null);
    const result = await executeAction(
      {
        action_type: "advanced_report",
        action_name: "Run Kinetic Growth Audit",
        resource_type: "dashboard",
        resource_id: null,
        metadata: { source: "dashboard_primary_cta" },
      },
      () => {
        setMessage("Growth audit started successfully. Check your inbox when it's ready.");
      }
    );

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <Card className="glass-card border-outline-variant/20">
      <CardHeader>
        <CardTitle>1-Click Growth Audit</CardTitle>
        <CardDescription>
          Launch a full-funnel analysis of your current marketing performance. We'll analyze your pipeline, campaigns,
          and conversion data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={handleClick}
          isLoading={isExecutingAction}
          className="w-full sm:w-auto bg-primary-container text-on-primary-container hover:bg-primary-fixed"
        >
          Run Kinetic Growth Audit
        </Button>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}

function PlanSummary({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const { openUpgradeModal } = useDashboard();

  const planLabels: Record<SubscriptionPlan, string> = {
    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  return (
    <Card className="glass-card border-outline-variant/20">
      <CardHeader>
        <CardTitle>Your Plan</CardTitle>
        <CardDescription>
          You are currently on the <span className="font-semibold text-primary-container">{planLabels[currentPlan]}</span>
          {" "}
          plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-400">
          Upgrade to unlock higher limits and advanced features like API access and advanced reporting.
        </div>
        <Button
          variant="outline"
          className="border-primary-container/60 text-primary-container hover:bg-primary-container/10"
          onClick={() => openUpgradeModal()}
        >
          Change Plan
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardInner() {
  const { user, isLoading } = useUser();
  const { organization } = useOrganization();
  const { subscription } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary-container">
          progress_activity
        </span>
      </div>
    );
  }

  if (!user || !organization) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">
          Please sign in and select an organization to access your dashboard.
        </p>
      </div>
    );
  }

  const plan: SubscriptionPlan = subscription?.plan ?? "free";

  return (
    <DashboardProvider
      userId={user.id}
      organizationId={organization.id}
      subscription={subscription ? { plan, limits: subscription.limits } : null}
    >
      <main className="flex-1 bg-surface-container-lowest pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <DashboardSidebar />
          <div className="flex-1 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Dashboard</p>
                <h1 className="text-3xl font-bold font-headline text-white mt-1">
                  Welcome back, {user.user_metadata?.full_name || user.email}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{organization.name}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <PrimaryActionSection />
              </div>
              <div className="space-y-6">
                <PlanSummary currentPlan={plan} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <UpgradeModal currentPlan={plan} />
    </DashboardProvider>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Header />
      <DashboardInner />
      <Footer />
    </>
  );
}
