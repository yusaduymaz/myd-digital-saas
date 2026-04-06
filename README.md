## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

 # Lein Digital B2B SaaS Platform

     A modern, production-ready **multi-tenant B2B SaaS platform** built with **Next.js**, **Supabase**, and **Tailwind CSS**. Designed for serious teams that need **secure tenant isolation**, **role-based
   access control**, and a **premium, glassmorphism-inspired UI** out of the box.

     > This repository is a complete reference implementation of a tenant-aware SaaS architecture with real-time admin capabilities and opinionated best practices.
---
   ## 📷 Ekran Görüntüleri

*(Buraya projenin önemli ekranlarının görsellerini ekleyebilirsiniz. Örneğin: Login Ekranı, Rol Yönetimi Sayfası, AI Analiz Sonucu vb.)*

<details>
<summary>📸 Ekran Görüntülerini Görüntüle</summary>
<br>

![image](/images/1.png)
![image](/images/2.png)
![image](/images/3.png)
![image](/images/4.png)
![image](/images/5.png)
![image](/images/6.png)
![image](/images/7.png)
![image](/images/8.png)
![image](/images/9.png)
![image](/images/10.png)
![image](/images/11.png)
![image](/images/12.png)
![image](/images/13.png)
![image](/images/14.png)
![image](/images/15.png)
![image](/images/16.png)
![image](/images/17.png)
![image](/images/18.png)
![image](/images/19.png)
![image](/images/20.png)



</details>

---

     ## 🔑 Key Features

     ### 1. Multi-Tenancy & Organizations
     - **Organizations** represent tenants (companies / workspaces).
     - **Users** can belong to multiple organizations via **memberships**.
     - All tenant data (subscriptions, actions, team members) is scoped by `organization_id`.
     - Strict **Row Level Security (RLS)** rules ensure that data from one organization is never visible to another.

     ### 2. 3-Tier RBAC (Roles & Access)
     The platform uses a clear 3-layer RBAC model:

     - **Super Admin / Platform Admin**
       - Access to the global **Super Admin Dashboard**.
       - Can inspect organizations, subscriptions, and usage across the entire platform.
       - Can reset quotas, force upgrades, and monitor system health.

     - **Organization Owner / Admin**
       - Manages a single organization: team members, roles, and billing tier.
       - Can invite new members and promote/demote roles (owner/admin/member).
       - Can access advanced features depending on plan (e.g., Enterprise tooling).

     - **Member / End User**
       - Uses the product within the limits of the current subscription.
       - Has restricted access to configuration and billing.

     RBAC is enforced across:
     - Supabase database policies (RLS).
     - Application-level checks in Next.js components and server actions.

     ### 3. Subscription Engine & Limits
     - `subscriptions` table tracks **plan** (`free`, `pro`, `enterprise`), **status**, and a JSONB `limits` column.
     - Plan capabilities include (examples):
       - `max_users`
       - `api_calls_per_month`
       - `actions_per_month`
     - The **Customer Dashboard** reads these limits and:
       - Shows quota usage.
       - Controls whether a given action is allowed.
       - Triggers an **Upgrade Plan** modal when limits are exceeded.

     ### 4. Realtime "God Mode" Admin Dashboard
     - A dedicated **/admin** dashboard for super admins.
     - Features:
       - **Tenant overview**: organizations, plans, usage.
       - **Metric cards**: API usage, active users, inferred system health.
       - **User management**: cross-tenant table with roles and statuses.
       - **Live feed**: recent `user_actions` streamed via **Supabase Realtime**.
     - Realtime subscriptions are set up with proper cleanup to avoid duplicate listeners, even under React Strict Mode.

     ### 5. Tenant-Level Team Management
     - **Team Settings** page (`/settings/team`) for organization admins/owners.
     - Features:
       - List of members for the current organization.
       - Role badges and inline role changes (owner/admin/member), with access control.
       - Seat limits tied to subscription (e.g., Free: 3, Pro: 10, Enterprise: unlimited).
       - Disabled **Invite Member** button + "Upgrade Plan" prompt when limits are reached.
     - Invitation flow powered by a **Next.js Server Action** using a Supabase **Service Role** admin client to:
       - Create or invite a user at the auth layer.
       - Insert a pending membership row with `invited_by`, `invited_at`, and `accepted_at = null`.

     ### 6. Premium Lein Digital UI
     - Dark, glassmorphism-inspired UI with gold accents.
     - Reusable layout components (Header, Footer, Sidebar, Cards, Sections).
     - Responsive, dashboard-first layout optimized for SaaS usage.

     ---

     ## 🧱 Tech Stack

     - **Framework:** Next.js (App Router)
     - **Language:** TypeScript
     - **Styling:** Tailwind CSS + custom design tokens
     - **Database & Auth:** Supabase (PostgreSQL, Auth, Realtime)
     - **ORM/Access:** Supabase JS client + typed helpers
     - **State Management:** React hooks (custom context for auth, organization, and subscriptions)
     - **Realtime:** Supabase Realtime channels for activity feeds
     - **Deployment:** Compatible with Vercel / Supabase hosting (or any Next.js-capable platform)

     ---

     ## 🏛 Architecture & Security

     ### Database Schema (High-Level)

     Core tables:
     - `users` – linked to `auth.users` (Supabase Auth identity).
     - `organizations` – tenant entities.
     - `memberships` – many-to-many join between `users` and `organizations`, with role and invitation metadata.
     - `subscriptions` – one-to-one or one-to-many relationship to organizations, holding plan and limit data.
     - `user_actions` – audit/usage log for key user operations, used for metrics and realtime feeds.

     ### Row Level Security (RLS)

     RLS is enabled on all tenant-scoped tables:
     - Policies ensure that:
       - A user only sees `memberships`, `subscriptions`, `organizations`, and `user_actions` tied to organizations they belong to.
       - Super admin operations are performed via a **Service Role** key and admin client.
     - Custom trigger functions are defined in the `public` schema (per Supabase best practices) and attached to `auth.users` where needed.

     ### Data Isolation

     - Every record that belongs to a tenant carries an `organization_id`.
     - All reads and writes from the app use this `organization_id` to scope queries.
     - Server Actions performing privileged actions (like invites) run with the admin client and apply their own explicit checks before mutating data.

     ---

     ## 🚀 Getting Started

     ### 1. Clone the Repository

     ```bash
     git clone https://github.com/your-username/lein-digital-saas.git
     cd lein-digital-saas

   2. Install Dependencies

     npm install

   3. Environment Variables

   Create a .env.local file in the project root with the following (adapt as needed):

     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     NEXTAUTH_SECRET=your-next-auth-secret-or-equivalent
     # Any other app-specific variables

     - NEXT_PUBLIC_* keys are used by the client-side Supabase instance.
     - SUPABASE_SERVICE_ROLE_KEY is sensitive and must only be used on the server (e.g., in Server Actions) to perform admin-level operations.

   4. Database Setup

     - Create a new Supabase project.
     - Run the SQL migrations provided in the supabase/ directory (schema, RLS policies, triggers).
     - Verify that RLS is enabled and that policies match your environment.

   5. Run the Development Server

     npm run dev

   Then open:

     - http://localhost:3000 for the main app.
     - http://localhost:3000/admin for the Super Admin dashboard (requires appropriate role).

   ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

   🧪 Testing & Local Workflows

     - Use seed scripts or Supabase SQL to create sample organizations, users, memberships, and subscriptions.
     - Test different roles (owner, admin, member) and plans (free, pro, enterprise) to verify:
       - Correct UI visibility.
       - Enforced quotas.
       - Admin dashboard metrics and realtime activity.

   ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

   🛠 Customization & Extensibility

     - Add new feature flags to the limits JSONB column and gate UI/behavior based on those.
     - Extend user_actions with more action types for richer analytics.
     - Attach webhooks or background jobs to subscription changes for billing providers (Stripe, Paddle, etc.).

   ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

   🤝 Contributing

   While this project is opinionated, it is designed as a reference architecture and a strong starting point. Contributions, suggestions, and discussions are welcome:

     - Fork the repo.
     - Create a feature branch.
     - Submit a PR with a clear description of the change.

   ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

   📄 License

   Specify your license here (e.g., MIT, Apache 2.0, proprietary).

   ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

   💬 Contact

   If you’re using this as a base for your own SaaS, or want help adapting it to your domain, feel free to reach out or open an issue. ```

