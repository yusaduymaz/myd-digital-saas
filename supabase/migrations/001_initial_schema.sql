-- ============================================================================
-- MYD Digital B2B SaaS - Database Schema
-- Multi-tenant architecture with strict Row Level Security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Organization membership roles
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- ============================================================================
-- TABLE: organizations (Multi-tenancy root)
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50), -- e.g., '1-10', '11-50', '51-200', '201-500', '500+'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for slug lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ============================================================================
-- TABLE: users (Linked to Supabase Auth)
-- ============================================================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    job_title VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    -- Default organization for quick access
    default_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    -- Metadata
    email_verified BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for email lookups
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- TABLE: memberships (Links users to organizations with roles)
-- ============================================================================

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'member',
    -- Invitation tracking
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure user can only have one membership per org
    UNIQUE(user_id, organization_id)
);

-- Indexes for common queries
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_role ON memberships(role);

-- ============================================================================
-- TABLE: subscriptions (Tracks plans, limits, and billing)
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Plan details
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    -- Stripe integration (optional)
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    -- Plan limits (stored as JSON for flexibility)
    limits JSONB DEFAULT '{
        "max_users": 3,
        "max_projects": 1,
        "max_storage_gb": 1,
        "api_calls_per_month": 1000,
        "features": ["basic_analytics"]
    }'::jsonb,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- One active subscription per organization
    UNIQUE(organization_id)
);

-- Index for Stripe lookups
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- TABLE: user_actions (Feature usage tracking per tier)
-- ============================================================================

CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Action details
    action_type VARCHAR(100) NOT NULL, -- e.g., 'api_call', 'report_generated', 'export'
    action_name VARCHAR(255) NOT NULL, -- e.g., 'Generate Monthly Report'
    -- Context
    resource_type VARCHAR(100), -- e.g., 'project', 'report', 'dashboard'
    resource_id UUID,
    -- Metadata (flexible storage for action-specific data)
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Billing period tracking
    billing_period_start DATE,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for analytics queries
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_organization_id ON user_actions(organization_id);
CREATE INDEX idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at);
CREATE INDEX idx_user_actions_billing_period ON user_actions(organization_id, billing_period_start);

-- ============================================================================
-- HELPER FUNCTIONS (All in public schema)
-- ============================================================================

-- Function to check if user is member of an organization
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.memberships
        WHERE organization_id = org_id
        AND user_id = auth.uid()
        AND is_active = TRUE
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user is admin/owner of an organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.memberships
        WHERE organization_id = org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = TRUE
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS SETOF UUID AS $$
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND is_active = TRUE;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS RLS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id IN (SELECT public.get_user_organization_ids()));

-- Only admins/owners can update their organization
CREATE POLICY "Admins can update their organization"
    ON organizations FOR UPDATE
    USING (public.is_organization_admin(id))
    WITH CHECK (public.is_organization_admin(id));

-- Any authenticated user can create an organization (they become owner)
CREATE POLICY "Authenticated users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can delete organization
CREATE POLICY "Owners can delete organization"
    ON organizations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE organization_id = id
            AND user_id = auth.uid()
            AND role = 'owner'
            AND is_active = TRUE
        )
    );

-- ----------------------------------------------------------------------------
-- USERS RLS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (id = auth.uid());

-- Users can view other users in same organization
CREATE POLICY "Users can view org members"
    ON public.users FOR SELECT
    USING (
        id IN (
            SELECT m.user_id FROM public.memberships m
            WHERE m.organization_id IN (SELECT public.get_user_organization_ids())
            AND m.is_active = TRUE
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- MEMBERSHIPS RLS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view memberships of their organizations
CREATE POLICY "Users can view org memberships"
    ON memberships FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Admins can insert memberships (invite users)
CREATE POLICY "Admins can invite users"
    ON memberships FOR INSERT
    WITH CHECK (public.is_organization_admin(organization_id));

-- Admins can update memberships (change roles)
CREATE POLICY "Admins can update memberships"
    ON memberships FOR UPDATE
    USING (public.is_organization_admin(organization_id))
    WITH CHECK (public.is_organization_admin(organization_id));

-- Admins can remove members (but not owners)
CREATE POLICY "Admins can remove members"
    ON memberships FOR DELETE
    USING (
        public.is_organization_admin(organization_id)
        AND role != 'owner'
    );

-- Users can leave organizations (delete own membership, except owners)
CREATE POLICY "Users can leave organization"
    ON memberships FOR DELETE
    USING (
        user_id = auth.uid()
        AND role != 'owner'
    );

-- ----------------------------------------------------------------------------
-- SUBSCRIPTIONS RLS POLICIES
-- ----------------------------------------------------------------------------

-- Members can view their organization's subscription
CREATE POLICY "Members can view subscription"
    ON subscriptions FOR SELECT
    USING (public.is_organization_member(organization_id));

-- Only admins can update subscription
CREATE POLICY "Admins can update subscription"
    ON subscriptions FOR UPDATE
    USING (public.is_organization_admin(organization_id))
    WITH CHECK (public.is_organization_admin(organization_id));

-- System creates subscriptions (via service role), but admins can too
CREATE POLICY "Admins can create subscription"
    ON subscriptions FOR INSERT
    WITH CHECK (public.is_organization_admin(organization_id));

-- ----------------------------------------------------------------------------
-- USER_ACTIONS RLS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view actions in their organizations
CREATE POLICY "Members can view org actions"
    ON user_actions FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Users can insert their own actions
CREATE POLICY "Users can log own actions"
    ON user_actions FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND organization_id IN (SELECT public.get_user_organization_ids())
    );

-- Actions are immutable (no update/delete by users)
-- Only service role can modify for data correction

-- ============================================================================
-- TRIGGERS (All functions in public schema)
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create user profile on signup (function in public schema, trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (Supabase allows this)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create owner membership when organization is created
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.memberships (user_id, organization_id, role, accepted_at)
    VALUES (auth.uid(), NEW.id, 'owner', NOW());
    
    -- Create default free subscription
    INSERT INTO public.subscriptions (organization_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization();

-- ============================================================================
-- DEFAULT SUBSCRIPTION LIMITS BY PLAN
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'Plan limits reference:
FREE: { max_users: 3, max_projects: 1, max_storage_gb: 1, api_calls_per_month: 1000, features: ["basic_analytics"] }
PRO: { max_users: 10, max_projects: 10, max_storage_gb: 10, api_calls_per_month: 50000, features: ["basic_analytics", "advanced_reports", "api_access", "priority_support"] }
ENTERPRISE: { max_users: -1, max_projects: -1, max_storage_gb: 100, api_calls_per_month: -1, features: ["basic_analytics", "advanced_reports", "api_access", "priority_support", "custom_integrations", "sso", "audit_logs", "dedicated_support"] }
Note: -1 means unlimited';

-- ============================================================================
-- GRANTS (Service role has full access, anon has none on these tables)
-- ============================================================================

-- Revoke all from anon (RLS will handle authenticated access)
REVOKE ALL ON organizations FROM anon;
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON memberships FROM anon;
REVOKE ALL ON subscriptions FROM anon;
REVOKE ALL ON user_actions FROM anon;

-- Grant to authenticated users (RLS policies control actual access)
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT, INSERT ON user_actions TO authenticated;
