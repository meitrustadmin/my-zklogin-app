import { throwExpression } from "../shared/utils";

// export const EXAMPLE_MOVE_PACKAGE_ID =
//   process.env.EXAMPLE_MOVE_PACKAGE_ID ??
//   throwExpression(new Error("EXAMPLE_MOVE_PACKAGE_ID not configured"));

export const EXAMPLE_MOVE_PACKAGE_ID ='sdfdsfdfdsf'

// export const API_HOST =
//   process.env.API_HOST ??
//   throwExpression(new Error("API_HOST not configured"));

console.log('All environment variables:', process.env.API_HOST);

export const API_HOST = 'http://localhost:3000'