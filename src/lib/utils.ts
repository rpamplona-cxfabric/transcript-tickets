import type { TenantUser } from "@/lib/udas/usersApi";

export const emailExpression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userName = (user: TenantUser) =>
  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
  user.email_address ||
  "Unnamed user";
