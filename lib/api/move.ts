import { throwExpression } from "../shared/utils";

export const EXAMPLE_MOVE_PACKAGE_ID =
  process.env.EXAMPLE_MOVE_PACKAGE_ID ??
  throwExpression(new Error("EXAMPLE_MOVE_PACKAGE_ID not configured"));

export const API_HOST =
  process.env.API_HOST ??
  throwExpression(new Error("API_HOST not configured"));

export const PASSKEYS_API_KEY =
  process.env.PASSKEYS_API_KEY ??
  throwExpression(new Error("PASSKEYS_API_KEY not configured"));

export const PASSKEYS_TENANT_ID =
  process.env.NEXT_PUBLIC_PASSKEYS_TENANT_ID ??
  throwExpression(new Error("NEXT_PUBLIC_PASSKEYS_TENANT_ID not configured"));
