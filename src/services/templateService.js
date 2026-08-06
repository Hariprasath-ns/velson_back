/**
 * Centralized template compiler to resolve variables inside notification strings.
 * E.g. "Request {{prNo}} has been created" -> "Request 25-26/PR00001 has been created"
 * 
 * @param {string} template The template string with placeholders
 * @param {object} data The key-value pairs representing parameters
 * @returns {string} Compiled string
 */
export const compileTemplate = (template, data = {}) => {
  if (!template) return "";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
};
