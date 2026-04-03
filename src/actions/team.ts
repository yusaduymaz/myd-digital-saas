"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { MembershipRole } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

interface InviteUserParams {
  email: string;
  organizationId: string;
  role: MembershipRole;
  invitedByUserId: string;
}

export async function inviteUserAction({
  email,
  organizationId,
  role,
  invitedByUserId,
}: InviteUserParams): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, error: "Email is required" };
  }

  try {
    // 1) Ensure there is an auth user for this email (or create an invite)
    const { data: existingUserData, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserByEmail(normalizedEmail);

    if (getUserError) {
      console.error("[Team] admin.getUserByEmail error", getUserError);
      return { success: false, error: "Unable to look up user by email" };
    }

    let authUserId = existingUserData?.user?.id;

    if (!authUserId) {
      // Create an invite for a brand new user. This will also create an auth.users row.
      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail);

      if (inviteError || !inviteData?.user) {
        console.error("[Team] admin.inviteUserByEmail error", inviteError);
        return {
          success: false,
          error: "Could not send invite. Please check your email settings and try again.",
        };
      }

      authUserId = inviteData.user.id;
    }

    // 2) Insert (or upsert) membership row for this organization
    const { error: membershipError } = await supabaseAdmin
      .from("memberships")
      .insert({
        user_id: authUserId,
        organization_id: organizationId,
        role,
        invited_by: invitedByUserId,
        invited_at: new Date().toISOString(),
        accepted_at: null,
        is_active: true,
      });

    if (membershipError) {
      console.error("[Team] Error inserting membership from server action", membershipError);
      return { success: false, error: membershipError.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Team] inviteUserAction unexpected error", error);
    return { success: false, error: message };
  }
}
