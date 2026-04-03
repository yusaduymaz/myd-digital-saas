"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings/team", label: "Team" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-high/60 p-4 glass-card">
      {navGroups.map((group) => (
        <div key={group.title} className="mb-4 last:mb-0">
          <p className="mb-2 text-xs font-label uppercase tracking-wide text-gray-500">
            {group.title}
          </p>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors
                    ${
                      isActive
                        ? "bg-primary-container/15 text-primary-container border border-primary-container/60"
                        : "text-gray-300 hover:text-white hover:bg-surface-container/80 border border-transparent"
                    }
                  `}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="material-symbols-outlined text-sm text-primary-container">
                      radio_button_checked
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
