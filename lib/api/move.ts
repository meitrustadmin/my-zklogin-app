import { throwExpression } from "../shared/utils";

console.log('process.env.EXAMPLE_MOVE_PACKAGE_ID', JSON.stringify(process.env.EXAMPLE_MOVE_PACKAGE_ID))
export const EXAMPLE_MOVE_PACKAGE_ID = process.env.EXAMPLE_MOVE_PACKAGE_ID || '';
if (!process.env.EXAMPLE_MOVE_PACKAGE_ID) {
  console.warn("Warning: EXAMPLE_MOVE_PACKAGE_ID is not set");
}
console.log('process.env.API_HOST ', JSON.stringify(process.env.API_HOST))
export const API_HOST = process.env.API_HOST || '';
if (!process.env.API_HOST) {
  console.warn("Warning: API_HOST is not set");
}

console.log('process.env.RPID ', JSON.stringify(process.env.RPID))

export const RPID = process.env.RPID || '';
if (!process.env.RPID) {
  console.warn("Warning: RPID is not set");
}

// const getEnvVariable = (key: string): string => {
//   if (typeof window === 'undefined') {
//     // Server-side
//     return process.env[key] || throwExpression(new Error(`${key} not configured on server`));
//   } else {
//     // Client-side
//     return (process.env.NEXT_PUBLIC_PREFIX ? process.env[`NEXT_PUBLIC_${key}`] : process.env[key]) || 
//            throwExpression(new Error(`${key} not configured on client`));
//   }
// };

// export const EXAMPLE_MOVE_PACKAGE_ID = getEnvVariable('EXAMPLE_MOVE_PACKAGE_ID');
// export const API_HOST = getEnvVariable('API_HOST');
// export const RPID = getEnvVariable('RPID');

// const getEnvVariable = (key: string, defaultValue: string): string => {
//   const value = typeof window === 'undefined'
//     ? process.env[key]
//     : process.env[`NEXT_PUBLIC_${key}`];

//   console.log(`[DEBUG] ${key}:`, value);

//   return value || defaultValue;
// };

// export const EXAMPLE_MOVE_PACKAGE_ID = getEnvVariable('EXAMPLE_MOVE_PACKAGE_ID', 'default_package_id');
// export const API_HOST = getEnvVariable('API_HOST', 'http://localhost:3000');
// export const RPID = getEnvVariable('RPID', 'localhost');

// console.log('[DEBUG] All env variables:', {
//   EXAMPLE_MOVE_PACKAGE_ID,
//   API_HOST,
//   RPID
// });

//export const API_HOST = ''
