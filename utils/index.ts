import { API_HOST } from "lib/api/move";

/**
 * Converts a string to an array.
 * If the input is already an array, it returns the input.
 * If the input is a string, it attempts to parse it as JSON.
 * If parsing fails, it returns an array with the string as a single element.
 * 
 * @param input - The input string or array to convert
 * @returns An array
 */
export function stringToArray(input: string | any[]): any[] {
  if (Array.isArray(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      return [input];
    }
  }
  
  return [input];
}


export async function checkAuthRecoveryExists (identifiers: string[]) {
  try {
      const response = await fetch(`${API_HOST}/api/recover/getbyidentifiers`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identifiers }),
      });
      
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      //console.log('data ' + JSON.stringify(data))
      return data
  } catch (error) {
      console.error('Error checking auth recovery:', error);
  }
};

