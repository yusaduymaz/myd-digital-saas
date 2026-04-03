"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { 
  User as DbUser, 
  Organization, 
  Membership, 
  Subscription,
  MembershipRole 
} from "@/lib/supabase/types";

interface AuthState {
  user: User | null;
  dbUser: DbUser | null;
  session: Session | null;
  isLoading: boolean;
  currentOrganization: Organization | null;
  currentMembership: Membership | null;
  currentSubscription: Subscription | null;
  organizations: Organization[];
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: MembershipRole | MembershipRole[]) => boolean;
  hasFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    dbUser: null,
    session: null,
    isLoading: true,
    currentOrganization: null,
    currentMembership: null,
    currentSubscription: null,
    organizations: [],
  });

  const supabase = useMemo(() => createClient(), []);

  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch user profile
    const { data: dbUserData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    
    const dbUser = dbUserData as DbUser | null;

    // Fetch user's organizations via memberships
    const { data: membershipsData } = await supabase
      .from("memberships")
      .select(`
        *,
        organizations(*)
      `)
      .eq("user_id", userId)
      .eq("is_active", true);

    type MembershipWithOrg = Membership & { organizations: Organization };
    const memberships = membershipsData as MembershipWithOrg[] | null;
    const organizations = memberships?.map((m) => m.organizations) || [];

    // Determine current organization (default or first)
    let currentOrg: Organization | null = null;
    let currentMembership: Membership | null = null;

    if (dbUser?.default_organization_id) {
      const membership = memberships?.find(
        (m) => m.organization_id === dbUser.default_organization_id
      );
      if (membership) {
        currentOrg = membership.organizations;
        currentMembership = membership;
      }
    }

    if (!currentOrg && memberships && memberships.length > 0) {
      currentOrg = memberships[0].organizations;
      currentMembership = memberships[0];
    }

    // Fetch subscription for current org
    let currentSubscription: Subscription | null = null;
    if (currentOrg) {
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .single();
      currentSubscription = subscriptionData as Subscription | null;
    }

    setState((prev) => ({
      ...prev,
      dbUser,
      organizations,
      currentOrganization: currentOrg,
      currentMembership,
      currentSubscription,
    }));
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchUserData(user.id);
    }
  }, [supabase, fetchUserData]);

  useEffect(() => {
    let isMounted = true;

    const getUserWithRetry = async () => {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const isLockContention = message.includes("stole it") || message.includes("lock:");

          if (!isLockContention || attempt === maxAttempts) {
            throw error;
          }

          await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
        }
      }

      return null;
    };

    const initializeSession = async () => {
      try {
        const user = await getUserWithRetry();

        let session: Session | null = null;
        try {
          const sessionResult = await supabase.auth.getSession();
          session = sessionResult.data.session;
        } catch (error) {
          // Some browsers/tabs can hit temporary auth lock contention.
          // We can continue with user-only state and wait for auth events.
          console.warn("[Auth] Session read skipped due to lock contention", error);
        }

        if (!isMounted) return;

        // Do not block the app on profile/membership fetch.
        setState((prev) => ({
          ...prev,
          session,
          user: user ?? null,
          isLoading: false,
        }));

        if (user) {
          void fetchUserData(user.id).catch((error) => {
            console.error("[Auth] fetchUserData failed", error);
          });
        }
      } catch (error) {
        console.error("[Auth] Failed to initialize session", error);
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initializeSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));

      if (event === "SIGNED_IN" && session?.user) {
        void fetchUserData(session.user.id).catch((error) => {
          console.error("[Auth] SIGNED_IN fetchUserData failed", error);
        });
      } else if (event === "SIGNED_OUT") {
        setState((prev) => ({
          ...prev,
          dbUser: null,
          organizations: [],
          currentOrganization: null,
          currentMembership: null,
          currentSubscription: null,
        }));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  const switchOrganization = async (orgId: string) => {
    const org = state.organizations.find((o) => o.id === orgId);
    if (!org) return;

    // Update default organization in DB
    if (state.dbUser) {
      await supabase
        .from("users")
        .update({ default_organization_id: orgId } as Record<string, unknown>)
        .eq("id", state.dbUser.id);
    }

    // Fetch new org's subscription
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", orgId)
      .single();

    // Find the membership for this org
    const { data: membershipData } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", state.user?.id)
      .eq("organization_id", orgId)
      .single();

    setState((prev) => ({
      ...prev,
      currentOrganization: org,
      currentMembership: membershipData as Membership | null,
      currentSubscription: subscriptionData as Subscription | null,
      dbUser: prev.dbUser
        ? { ...prev.dbUser, default_organization_id: orgId }
        : null,
    }));
  };

  const hasRole = (role: MembershipRole | MembershipRole[]) => {
    if (!state.currentMembership) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(state.currentMembership.role);
  };

  const hasFeature = (feature: string) => {
    if (!state.currentSubscription?.limits) return false;
    return state.currentSubscription.limits.features.includes(feature);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        switchOrganization,
        refreshUser,
        hasRole,
        hasFeature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { user, dbUser, isLoading } = useAuth();
  return { user, dbUser, isLoading };
}

export function useOrganization() {
  const { currentOrganization, currentMembership, organizations, switchOrganization } = useAuth();
  return { organization: currentOrganization, membership: currentMembership, organizations, switchOrganization };
}

export function useSubscription() {
  const { currentSubscription, hasFeature } = useAuth();
  return { subscription: currentSubscription, hasFeature };
}
