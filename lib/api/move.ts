import { throwExpression } from "../shared/utils";

export const EXAMPLE_MOVE_PACKAGE_ID =
  process.env.EXAMPLE_MOVE_PACKAGE_ID ??
  throwExpression(new Error("EXAMPLE_MOVE_PACKAGE_ID not configured"));

  export const API_HOST =
  process.env.API_HOST ??
  throwExpression(new Error("API_HOST not configured"));
