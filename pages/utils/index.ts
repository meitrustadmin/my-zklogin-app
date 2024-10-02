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
