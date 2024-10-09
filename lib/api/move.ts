import { throwExpression } from "../shared/utils";

//console.log('process.env.EXAMPLE_MOVE_PACKAGE_ID', JSON.stringify(process.env.EXAMPLE_MOVE_PACKAGE_ID))
export const EXAMPLE_MOVE_PACKAGE_ID = process.env.EXAMPLE_MOVE_PACKAGE_ID || '';
if (!process.env.EXAMPLE_MOVE_PACKAGE_ID) {
  console.warn("Warning: EXAMPLE_MOVE_PACKAGE_ID is not set");
}

export const API_HOST = process.env.API_HOST || '';
if (!process.env.API_HOST) {
  console.warn("Warning: API_HOST is not set");
}

export const RPID = process.env.RPID || '';
if (!process.env.RPID) {
  console.warn("Warning: RPID is not set");
}

//export const API_HOST = ''
