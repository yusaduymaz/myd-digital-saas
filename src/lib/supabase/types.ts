// ============================================================================
// MYD Digital B2B SaaS - Database Types
// Auto-generated from Supabase schema
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types
export type MembershipRole = 'owner' | 'admin' | 'member';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// Subscription limits structure
export interface SubscriptionLimits {
  max_users: number; // -1 = unlimited
  max_projects: number; // -1 = unlimited
  max_storage_gb: number;
  api_calls_per_month: number; // -1 = unlimited
  features: string[];
}

// Default limits by plan
export const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    max_users: 3,
    max_projects: 1,
    max_storage_gb: 1,
    api_calls_per_month: 1000,
    features: ['basic_analytics'],
  },
  pro: {
    max_users: 10,
    max_projects: 10,
    max_storage_gb: 10,
    api_calls_per_month: 50000,
    features: ['basic_analytics', 'advanced_reports', 'api_access', 'priority_support'],
  },
  enterprise: {
    max_users: -1,
    max_projects: -1,
    max_storage_gb: 100,
    api_calls_per_month: -1,
    features: [
      'basic_analytics',
      'advanced_reports',
      'api_access',
      'priority_support',
      'custom_integrations',
      'sso',
      'audit_logs',
      'dedicated_support',
    ],
  },
};

// ============================================================================
// Table Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  timezone: string;
  default_organization_id: string | null;
  email_verified: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: MembershipRole;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  limits: SubscriptionLimits;
  created_at: string;
  updated_at: string;
}

export interface UserAction {
  id: string;
  user_id: string;
  organization_id: string;
  action_type: string;
  action_name: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Json;
  billing_period_start: string | null;
  created_at: string;
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export interface OrganizationInsert {
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
}

export interface UserInsert {
  id: string; // Must match auth.users.id
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  job_title?: string | null;
  timezone?: string;
  default_organization_id?: string | null;
}

export interface MembershipInsert {
  user_id: string;
  organization_id: string;
  role?: MembershipRole;
  invited_by?: string | null;
  invited_at?: string | null;
}

export interface UserActionInsert {
  user_id: string;
  organization_id: string;
  action_type: string;
  action_name: string;
  resource_type?: string | null;
  resource_id?: string | null;
  metadata?: Json;
  billing_period_start?: string | null;
}

// ============================================================================
// Update Types (for updating records)
// ============================================================================

export interface OrganizationUpdate {
  name?: string;
  slug?: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
}

export interface UserUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  job_title?: string | null;
  timezone?: string;
  default_organization_id?: string | null;
}

export interface MembershipUpdate {
  role?: MembershipRole;
  is_active?: boolean;
  accepted_at?: string | null;
}

export interface SubscriptionUpdate {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  limits?: SubscriptionLimits;
}

// ============================================================================
// Joined Types (for common queries with relations)
// ============================================================================

export interface MembershipWithUser extends Membership {
  user: User;
}

export interface MembershipWithOrganization extends Membership {
  organization: Organization;
}

export interface OrganizationWithSubscription extends Organization {
  subscription: Subscription | null;
}

export interface UserWithMemberships extends User {
  memberships: MembershipWithOrganization[];
}

// ============================================================================
// Database Schema Type (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      memberships: {
        Row: Membership;
        Insert: MembershipInsert;
        Update: MembershipUpdate;
      };
      subscriptions: {
        Row: Subscription;
        Insert: never; // Created automatically via trigger
        Update: SubscriptionUpdate;
      };
      user_actions: {
        Row: UserAction;
        Insert: UserActionInsert;
        Update: never; // Immutable
      };
    };
    Enums: {
      membership_role: MembershipRole;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
    };
  };
}
