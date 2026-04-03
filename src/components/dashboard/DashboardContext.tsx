"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriptionPlan, SubscriptionLimits, UserActionInsert } from "@/lib/supabase/types";
import { PLAN_LIMITS } from "@/lib/supabase/types";

interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

interface DashboardContextValue {
  // Quota checking
  checkQuota: (actionType: string) => Promise<QuotaCheckResult>;
  
  // Action execution with quota check
  executeAction: (
    action: Omit<UserActionInsert, "user_id" | "organization_id">,
    onSuccess?: () => void
  ) => Promise<{ success: boolean; error?: string }>;
  
  // Upgrade modal state
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  upgradeReason: string | null;
  
  // Loading states
  isExecutingAction: boolean;
  isCheckingQuota: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  userId: string;
  organizationId: string;
  subscription: {
    plan: SubscriptionPlan;
    limits: SubscriptionLimits;
  } | null;
}

export function DashboardProvider({
  children,
  userId,
  organizationId,
  subscription,
}: DashboardProviderProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  const supabase = createClient();
  const limits = subscription?.limits || PLAN_LIMITS.free;
  const plan = subscription?.plan || "free";

  const openUpgradeModal = useCallback((reason?: string) => {
    setUpgradeReason(reason || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeReason(null);
  }, []);

  const checkQuota = useCallback(async (actionType: string): Promise<QuotaCheckResult> => {
    setIsCheckingQuota(true);
    
    try {
      // Check feature access
      if (actionType === "advanced_report" && !limits.features.includes("advanced_reports")) {
        return {
          allowed: false,
          reason: "Advanced reports require a Pro or Enterprise plan",
        };
      }

      if (actionType === "api_access" && !limits.features.includes("api_access")) {
        return {
          allowed: false,
          reason: "API access requires a Pro or Enterprise plan",
        };
      }

      // Check API call quota
      if (actionType === "api_call") {
        if (limits.api_calls_per_month === -1) {
          return { allowed: true }; // Unlimited
        }

        // Get current month's usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from("user_actions")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("action_type", "api_call")
          .gte("created_at", startOfMonth.toISOString());

        const currentUsage = count || 0;
        
        if (currentUsage >= limits.api_calls_per_month) {
          return {
            allowed: false,
            reason: `You've reached your monthly API limit (${limits.api_calls_per_month} calls)`,
            currentUsage,
            limit: limits.api_calls_per_month,
          };
        }

        return { allowed: true, currentUsage, limit: limits.api_calls_per_month };
      }

      // Default: allow action
      return { allowed: true };
    } finally {
      setIsCheckingQuota(false);
    }
  }, [supabase, organizationId, limits]);

  const executeAction = useCallback(async (
    action: Omit<UserActionInsert, "user_id" | "organization_id">,
    onSuccess?: () => void
  ): Promise<{ success: boolean; error?: string }> => {
    setIsExecutingAction(true);

    try {
      // Check quota first
      const quotaCheck = await checkQuota(action.action_type);
      
      if (!quotaCheck.allowed) {
        openUpgradeModal(quotaCheck.reason);
        return { success: false, error: quotaCheck.reason };
      }

      // Log the action
      const { error } = await supabase.from("user_actions").insert({
        ...action,
        user_id: userId,
        organization_id: organizationId,
        billing_period_start: new Date().toISOString().slice(0, 10),
      });

      if (error) {
        console.error("Failed to log action:", error);
        return { success: false, error: error.message };
      }

      onSuccess?.();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    } finally {
      setIsExecutingAction(false);
    }
  }, [supabase, userId, organizationId, checkQuota, openUpgradeModal]);

  return (
    <DashboardContext.Provider
      value={{
        checkQuota,
        executeAction,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeReason,
        isExecutingAction,
        isCheckingQuota,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
