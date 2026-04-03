"use client";

import { useEffect, useMemo, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useUser, useOrganization, useSubscription, useAuth } from "@/lib/supabase";
import type { Membership, MembershipRole, SubscriptionPlan, SubscriptionLimits } from "@/lib/supabase/types";
import { PLAN_LIMITS } from "@/lib/supabase/types";
import { inviteUserAction } from "@/actions/team";

interface MemberRow {
  membership: Membership;
  userEmail: string;
  userName: string | null;
}

export default function TeamSettingsPage() {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const { subscription } = useSubscription();
  const { hasRole } = useAuth();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MembershipRole>("member");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const canManageTeam = hasRole(["owner", "admin"]);

  const plan: SubscriptionPlan = subscription?.plan ?? "free";
  const limits: SubscriptionLimits = subscription?.limits ?? PLAN_LIMITS[plan];
  const maxUsers = limits.max_users;

  const seatsUsed = members.length;
  const isUnlimited = maxUsers === -1;
  const hasReachedLimit = !isUnlimited && seatsUsed >= maxUsers;

  useEffect(() => {
    if (!organization) return;

    const loadMembers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("memberships")
        .select(
          "*, user:users!memberships_user_id_fkey(email, full_name)"
        )
        .eq("organization_id", organization.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[Team] Error loading members", error);
        setIsLoading(false);
        return;
      }

      const rows: MemberRow[] = (data || []).map((m: any) => ({
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
        userEmail: m.user?.email || "",
        userName: m.user?.full_name || null,
      }));

      setMembers(rows);
      setIsLoading(false);
    };

    void loadMembers();
  }, [organization, supabase]);

  const handleInvite = async () => {
    if (!organization || !user) return;

    setInviteError(null);
    if (!inviteEmail) {
      setInviteError("Please enter an email address");
      return;
    }

    setIsInviting(true);
    try {
      const result = await inviteUserAction({
        email: inviteEmail,
        organizationId: organization.id,
        role: inviteRole,
        invitedByUserId: user.id,
      });

      if (!result.success) {
        setInviteError(result.error || "Could not send invite. Please try again.");
        return;
      }

      // Refresh member list
      setInviteEmail("");
      setInviteRole("member");
      setIsInviteOpen(false);

      const { data, error } = await supabase
        .from("memberships")
        .select(
          "*, user:users!memberships_user_id_fkey(email, full_name)"
        )
        .eq("organization_id", organization.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (!error) {
        const rows: MemberRow[] = (data || []).map((m: any) => ({
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
          userEmail: m.user?.email || "",
          userName: m.user?.full_name || null,
        }));
        setMembers(rows);
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MembershipRole) => {
    if (!canManageTeam || !organization) return;

    const member = members.find((m) => m.membership.id === memberId);
    if (!member) return;

    // Prevent non-owner from changing owner role
    if (membership?.role !== "owner" && member.membership.role === "owner") {
      return;
    }

    const { error } = await supabase
      .from("memberships")
      .update({ role: newRole })
      .eq("id", memberId)
      .eq("organization_id", organization.id);

    if (error) {
      console.error("[Team] Error updating role", error);
      return;
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.membership.id === memberId
          ? { ...m, membership: { ...m.membership, role: newRole } }
          : m
      )
    );
  };

  if (!user || !organization) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-surface-container-lowest pt-24 pb-16 flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            Please sign in and select an organization to manage your team.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const seatLabel = isUnlimited
    ? "Unlimited seats"
    : `${seatsUsed} / ${maxUsers} seats used`;

  const usagePercent = isUnlimited || maxUsers === 0 ? 0 : Math.min(100, (seatsUsed / maxUsers) * 100);

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface-container-lowest pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <DashboardSidebar />
          <div className="flex-1 space-y-8">
            <header className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-primary-container font-label uppercase tracking-wide">
                  Settings
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-white mt-1">
                  Team Management
                </h1>
                <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                  Invite teammates, manage roles, and stay within your plan&apos;s seat limits.
                </p>
              </div>
            </header>

            {/* Plan & seats summary */}
          <Card className="glass-card border-outline-variant/30 bg-surface-container-high/40">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Seats & Access</CardTitle>
                <CardDescription>
                  Your current plan: <span className="font-medium text-primary-container capitalize">{plan}</span>
                </CardDescription>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                {isUnlimited ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                    <span className="material-symbols-outlined text-sm">all_inclusive</span>
                    Enterprise • Unlimited seats
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-gray-300">{seatLabel}</span>
                    <div className="w-48 h-2 rounded-full bg-surface-container-low overflow-hidden">
                      <div
                        className="h-full bg-primary-container transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            {!isUnlimited && hasReachedLimit && (
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3">
                  <p className="text-sm text-amber-100">
                    You&apos;ve reached your seat limit for this plan. Upgrade to add more team members.
                  </p>
                  <Button
                    variant="outline"
                    className="border-primary-container/60 text-primary-container hover:bg-primary-container/10"
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Team table */}
          <Card className="glass-card border-outline-variant/30 bg-surface-container-high/40">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Active members in <span className="font-medium text-primary-container">{organization.name}</span>.
                </CardDescription>
              </div>
              {canManageTeam && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={hasReachedLimit}
                  className="border-primary-container/60 text-primary-container hover:bg-primary-container/10 disabled:cursor-not-allowed"
                  onClick={() => setIsInviteOpen(true)}
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-outline-variant/20">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400">
                          Loading team members...
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400">
                          No team members yet.
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => {
                        const isSelf = m.userEmail === user.email;
                        const canEditRole =
                          canManageTeam && (!isSelf || membership?.role === "owner");

                        return (
                          <tr
                            key={m.membership.id}
                            className="border-b border-outline-variant/10 hover:bg-surface-container/60 transition-colors"
                          >
                            <td className="py-3 pr-4 text-gray-100">
                              {m.userName || "-"}
                            </td>
                            <td className="py-3 pr-4 text-gray-300">
                              {m.userEmail}
                            </td>
                            <td className="py-3 pr-4 text-gray-300">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize
                                  ${m.membership.role === "owner" ? "bg-amber-400/15 text-amber-200 border border-amber-400/40" : ""}
                                  ${m.membership.role === "admin" ? "bg-primary-container/10 text-primary-container border border-primary-container/40" : ""}
                                  ${m.membership.role === "member" ? "bg-surface-container-low text-gray-300 border border-outline-variant/30" : ""}
                                `}
                              >
                                {m.membership.role}
                              </span>
                              {canEditRole && (
                                <select
                                  className="mt-2 block rounded-md border border-outline-variant/30 bg-surface-container px-2 py-1 text-xs text-gray-200"
                                  value={m.membership.role}
                                  onChange={(e) =>
                                    handleRoleChange(m.membership.id, e.target.value as MembershipRole)
                                  }
                                >
                                  <option value="owner">Owner</option>
                                  <option value="admin">Admin</option>
                                  <option value="member">Member</option>
                                </select>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-300">
                              {m.membership.accepted_at
                                ? "Active"
                                : m.membership.invited_at
                                ? "Invitation pending"
                                : "Unknown"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Invite modal */}
          {isInviteOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => {
                  if (!isInviting) {
                    setIsInviteOpen(false);
                  }
                }}
              />
              <div className="relative w-full max-w-md mx-4 rounded-2xl border border-outline-variant/30 bg-surface-container-high/95 p-6 shadow-2xl">
                <h2 className="text-xl font-bold font-headline text-white mb-2">
                  Invite a teammate
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Send an invitation to join <span className="font-medium text-primary-container">{organization.name}</span>.
                </p>
                <div className="space-y-4">
                  <Input
                    id="invite-email"
                    type="email"
                    label="Email address"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    error={inviteError || undefined}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Role
                    </label>
                    <select
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MembershipRole)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {membership?.role === "owner" && <option value="owner">Owner</option>}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsInviteOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    isLoading={isInviting}
                    disabled={hasReachedLimit}
                    className="bg-primary-container text-on-primary-container hover:bg-primary-fixed"
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
