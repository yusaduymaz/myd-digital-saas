"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase";
import type { Organization, Subscription, SubscriptionPlan, SubscriptionLimits, Membership, UserAction } from "@/lib/supabase/types";
import { PLAN_LIMITS } from "@/lib/supabase/types";

interface TenantRow {
  organization: Organization;
  subscription: Subscription | null;
  totalActions: number;
  apiCallsThisMonth: number;
  activeUsers: number;
}

interface UserRow {
  membership: Membership;
  organization: Organization | null;
  subscription: Subscription | null;
  userEmail: string;
  userName: string | null;
}

export default function SuperAdminDashboardPage() {
  const {
    user,
    session,
    currentOrganization,
    currentMembership,
    isLoading,
    hasRole,
    refreshUser,
  } = useAuth();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [activity, setActivity] = useState<UserAction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, "reset" | "upgrade" | null>>({});
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const channelRef = useRef<any>(null);
  const hasSubscribedRef = useRef(false);

  // Safety net: if auth loading hangs, surface debug info instead of infinite spinner
  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("[Admin] Auth loading timeout. Debug info:", {
          session,
          user,
          currentOrganization,
          currentMembership,
        });
        setHasTimedOut(true);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isLoading, session, user, currentOrganization, currentMembership]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    let isCancelled = false;

    const load = async () => {
      setIsLoadingData(true);

      // Load organizations the current admin can see
      const { data: orgs } = await supabase.from("organizations").select("*");
      if (!orgs) {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
        return;
      }

      // Load subscriptions for these organizations
      const orgIds = orgs.map((o) => o.id);
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .in("organization_id", orgIds);

      const subsByOrg = new Map<string, Subscription>();
      (subs || []).forEach((s) => subsByOrg.set(s.organization_id, s as Subscription));

      // Load metrics in parallel per org
      const tenantRows: TenantRow[] = [];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      await Promise.all(
        orgs.map(async (org) => {
          const [totalActionsRes, apiRes, activeUsersRes] = await Promise.all([
            supabase
              .from("user_actions")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", org.id),
            supabase
              .from("user_actions")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", org.id)
              .eq("action_type", "api_call")
              .gte("created_at", startOfMonth.toISOString()),
            supabase
              .from("memberships")
              .select("user_id", { count: "exact", head: true })
              .eq("organization_id", org.id)
              .eq("is_active", true),
          ]);

          tenantRows.push({
            organization: org as Organization,
            subscription: subsByOrg.get(org.id) || null,
            totalActions: totalActionsRes.count || 0,
            apiCallsThisMonth: apiRes.count || 0,
            activeUsers: activeUsersRes.count || 0,
          });
        })
      );

      if (isCancelled) return;

      setTenants(tenantRows);

      // Load user management data (explicit FKs to avoid ambiguity)
      const { data: memberships, error: membershipsError } = await supabase
        .from("memberships")
        .select("*, user:users!memberships_user_id_fkey(email, full_name), organization:organizations(id, name)")
        .eq("is_active", true);

      if (membershipsError) {
        console.error("[Admin] Error fetching memberships:", membershipsError);
      }

      const userRows: UserRow[] = (memberships || []).map((m: any) => ({
        membership: {
          id: m.id,
          user_id: m.user_id,
          organization_id: m.organization_id,
          role: m.role,
          invited_by: m.invited_by,
          invited_at: m.invited_at,
          accepted_at: m.accepted_at,
          is_active: m.is_active,
          created_at: m.created_at,
          updated_at: m.updated_at,
        },
        organization: m.organization as Organization | null,
        subscription: subsByOrg.get(m.organization_id) || null,
        userEmail: m.user?.email || "",
        userName: m.user?.full_name || null,
      }));

      if (isCancelled) return;

      setUsers(userRows);

      // Live feed initial batch
      const { data: initialActions } = await supabase
        .from("user_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!isCancelled) {
        setActivity((initialActions || []) as UserAction[]);
        setIsLoadingData(false);
      }
    };

    void load();

    // Realtime subscription: define channel, attach listeners, then subscribe
    const channelName = `user_actions_feed_admin_${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_actions" },
        (payload: any) => {
          if (isCancelled) return;
          const newAction = payload.new as UserAction;
          setActivity((prev) => [newAction, ...prev].slice(0, 20));
        }
      );

    channelRef.current = channel;

    channel.subscribe((status, err) => {
      if (err) {
        console.error("[Admin] Error subscribing to user_actions feed", err);
      }
    });

    return () => {
      isCancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      } else {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const metrics = useMemo(() => {
    const totalOrgs = tenants.length;
    const totalUsers = tenants.reduce((sum, t) => sum + t.activeUsers, 0);
    const totalApi = tenants.reduce((sum, t) => sum + t.apiCallsThisMonth, 0);

    // Simple system health indicator based on API usage vs theoretical limits
    const totalLimit = tenants.reduce((sum, t) => {
      const limits = (t.subscription?.limits || PLAN_LIMITS.free) as SubscriptionLimits;
      return sum + (limits.api_calls_per_month === -1 ? 0 : limits.api_calls_per_month);
    }, 0);

    const utilization = totalLimit > 0 ? totalApi / totalLimit : 0;
    let healthLabel = "All systems operational";
    let healthColor = "text-emerald-400";
    if (utilization > 0.9) {
      healthLabel = "High load - monitor closely";
      healthColor = "text-amber-400";
    } else if (utilization > 1) {
      healthLabel = "Over capacity - investigate";
      healthColor = "text-red-400";
    }

    return { totalOrgs, totalUsers, totalApi, healthLabel, healthColor };
  }, [tenants]);

  const handleResetQuota = async (orgId: string) => {
    const supabase = createClient();
    setActionLoading((prev) => ({ ...prev, [orgId]: "reset" }));
    try {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, limits")
        .eq("organization_id", orgId)
        .single();
      if (!sub) return;
      const limits = sub.limits as SubscriptionLimits;
      const updatedLimits: SubscriptionLimits = {
        ...limits,
        api_calls_per_month:
          limits.api_calls_per_month === -1
            ? -1
            : limits.api_calls_per_month + 50000,
      };
      await supabase
        .from("subscriptions")
        .update({ limits: updatedLimits })
        .eq("id", sub.id);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orgId]: null }));
    }
  };

  const handleForceUpgrade = async (orgId: string) => {
    const supabase = createClient();
    setActionLoading((prev) => ({ ...prev, [orgId]: "upgrade" }));
    try {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, plan")
        .eq("organization_id", orgId)
        .single();
      if (!sub) return;
      const currentPlan = sub.plan as SubscriptionPlan;
      const nextPlan: SubscriptionPlan =
        currentPlan === "free" ? "pro" : "enterprise";
      const newLimits = PLAN_LIMITS[nextPlan];
      await supabase
        .from("subscriptions")
        .update({ plan: nextPlan, limits: newLimits })
        .eq("id", sub.id);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orgId]: null }));
    }
  };

  const handleRetry = async () => {
    console.info("[Admin] Manual auth refresh triggered from timeout fallback");
    setHasTimedOut(false);
    await refreshUser();
  };

  if (isLoading && !hasTimedOut) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-background">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary-container">
          progress_activity
        </span>
      </div>
    );
  }

  if (isLoading && hasTimedOut) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-background">
        <div className="glass-card p-8 rounded-xl border border-outline-variant/30 bg-surface-container/80 backdrop-blur-2xl text-center max-w-md mx-4">
          <h2 className="font-headline text-xl font-bold text-white mb-2">
            Still connecting to Supabase…
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Admin session is taking longer than expected to load. Check the console for missing data details,
            then retry.
          </p>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="border-primary-container/60 text-primary-container hover:bg-primary-container/10"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !hasRole(["admin", "owner"])) {
    console.warn("[Admin] Access denied: missing user or insufficient role", {
      user,
      currentMembership,
    });
    return (
      <>
        <Header />
        <main className="flex-1 pt-24 pb-16 bg-surface-container-lowest flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            You do not have permission to access the Super Admin Dashboard.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface-container-lowest pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-sm text-primary-container font-label uppercase tracking-wide">
                Super Admin
              </p>
              <h1 className="text-3xl md:text-4xl font-bold font-headline text-white mt-1">
                Platform Control Center
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                Real-time visibility into all tenants, usage, and system health across the MYD Digital platform.
              </p>
            </div>
          </header>

          {/* Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card border-primary-container/30 bg-surface-container-high/40">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">
                  Tenants
                </CardDescription>
                <CardTitle className="text-3xl text-primary-container">
                  {metrics.totalOrgs}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass-card bg-surface-container-high/40">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">
                  Active Users
                </CardDescription>
                <CardTitle className="text-3xl text-white">
                  {metrics.totalUsers}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass-card bg-surface-container-high/40">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">
                  API Calls (This Month)
                </CardDescription>
                <CardTitle className="text-3xl text-white">
                  {metrics.totalApi.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="glass-card bg-surface-container-high/40 border border-outline-variant/40">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">
                  System Health
                </CardDescription>
                <CardTitle className={`text-lg ${metrics.healthColor}`}>
                  {metrics.healthLabel}
                </CardTitle>
              </CardHeader>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Tenant Overview */}
            <Card className="glass-card xl:col-span-2 border-outline-variant/30 bg-surface-container-high/40">
              <CardHeader>
                <CardTitle>Tenant Overview</CardTitle>
                <CardDescription>
                  All organizations, their plans, and key usage metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-outline-variant/20">
                        <th className="py-2 pr-4">Organization</th>
                        <th className="py-2 pr-4">Plan</th>
                        <th className="py-2 pr-4">Active Users</th>
                        <th className="py-2 pr-4">Total Actions</th>
                        <th className="py-2 pr-4">API This Month</th>
                        <th className="py-2 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => {
                        const plan = (tenant.subscription?.plan || "free") as SubscriptionPlan;
                        const loadingState = actionLoading[tenant.organization.id];
                        return (
                          <tr
                            key={tenant.organization.id}
                            className="border-b border-outline-variant/10 hover:bg-surface-container/60 transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-white">
                                  {tenant.organization.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {tenant.organization.slug}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 capitalize text-gray-200">
                              {plan}
                            </td>
                            <td className="py-3 pr-4 text-gray-200">
                              {tenant.activeUsers}
                            </td>
                            <td className="py-3 pr-4 text-gray-200">
                              {tenant.totalActions.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-gray-200">
                              {tenant.apiCallsThisMonth.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <div className="inline-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isLoading={loadingState === "reset"}
                                  onClick={() => handleResetQuota(tenant.organization.id)}
                                  className="border-amber-400/60 text-amber-300 hover:bg-amber-400/10"
                                >
                                  Reset Quota
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isLoading={loadingState === "upgrade"}
                                  onClick={() => handleForceUpgrade(tenant.organization.id)}
                                  className="border-primary-container/60 text-primary-container hover:bg-primary-container/10"
                                >
                                  Force Upgrade
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {tenants.length === 0 && !isLoadingData && (
                    <p className="text-sm text-gray-500 mt-4">
                      No organizations found for your admin scope.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            <Card className="glass-card border-outline-variant/30 bg-surface-container-high/40">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Live feed of actions happening across your tenants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {activity.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 text-xs text-gray-300 border-b border-outline-variant/10 pb-2"
                    >
                      <span className="mt-0.5 material-symbols-outlined text-primary-container text-base">
                        bolt
                      </span>
                      <div>
                        <p className="font-medium text-white">
                          {a.action_name}
                        </p>
                        <p className="text-gray-400">
                          {a.action_type} • {new Date(a.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No recent activity yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Management */}
          <section>
            <Card className="glass-card border-outline-variant/30 bg-surface-container-high/40">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and roles across your organizations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-outline-variant/20">
                        <th className="py-2 pr-4">User</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Organization</th>
                        <th className="py-2 pr-4">Plan</th>
                        <th className="py-2 pr-4">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((row) => (
                        <tr
                          key={row.membership.id}
                          className="border-b border-outline-variant/10 hover:bg-surface-container/60 transition-colors"
                        >
                          <td className="py-3 pr-4 text-gray-100">
                            {row.userName || "-"}
                          </td>
                          <td className="py-3 pr-4 text-gray-300">
                            {row.userEmail}
                          </td>
                          <td className="py-3 pr-4 text-gray-300">
                            {row.organization?.name || "-"}
                          </td>
                          <td className="py-3 pr-4 text-gray-300 capitalize">
                            {(row.subscription?.plan || "free") as string}
                          </td>
                          <td className="py-3 pr-4 text-gray-300 capitalize">
                            {row.membership.role}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && !isLoadingData && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-sm text-gray-500"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
