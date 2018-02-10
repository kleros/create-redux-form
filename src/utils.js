/**
 * Maps object into an array.
 * @param {object} obj - The obj to map over.
 * @param {object} func - The function to call with (value, key).
 * @returns {any[]|object} - An array with the results of calling func on every property of obj.
 */
export function objMap(obj, func) {
  const keys = Object.keys(obj)
  const keysLen = keys.length
  const result = []

  for (let i = 0; i < keysLen; i++) {
    result.push(func(obj[keys[i]], keys[i]))
  }

  return result
}

/**
 * Converts a string in camel case to title case. e.g. helloWorld => Hello World.
 * @param {string} str - The string to convert.
 * @returns {string} - The converted string.
 */
export function camelToTitleCase(str) {
  return str.replace(
    /(^[a-z])|([a-z][A-Z])|([A-Z][a-z])/g,
    (m, p1, p2, p3) =>
      p1 ? p1.toUpperCase() : p2 ? p2[0] + ' ' + p2[1] : ' ' + p3
  )
}
