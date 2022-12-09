import { randomBytes } from "crypto";

/**
 * generate api key
 * @param {number} size
 * @param {BufferEncoding} format
 *
 * @return {string}
 */
export function generateKey(size = 32, format: BufferEncoding = "base64") {
  const buffer = randomBytes(size);
  return buffer.toString(format);
}
