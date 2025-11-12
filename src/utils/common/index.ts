import CryptoJS from 'crypto-js'

export const generateFileName: (file: File) => string = (file: File) => {
  const timestamp = new Date().getTime()
  const randomString = CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex)
  return `${timestamp}${randomString}${file.name.split('.').pop()}`
}

/**
 * 解密 base64 格式的密文（AES-CBC + PKCS7）
 * @param cipherBase64 密文（base64）
 * @param keyStr 密钥（utf8 字符串，需 16/24/32 字节）
 * @param ivStr iv（utf8 字符串，通常 16 字节）
 */
// ...existing code...
export async function aesDecryptCryptoJS(
  cipherBase64: string,
  keyStr: string,
  ivStr: string = '54406223660381758585'
) {
  // helper: parse key/iv which may be hex or utf8, ensure 16 bytes for AES-128
  const normalizeWord = (input: string | undefined, makeLength = 16) => {
    if (!input) {
      return CryptoJS.lib.WordArray.create(new Uint8Array(makeLength))
    }
    // hex string?
    if (
      /^[0-9a-fA-F]+$/.test(input) &&
      (input.length === makeLength * 2 || input.length === 32 || input.length === 64)
    ) {
      return CryptoJS.enc.Hex.parse(input.slice(0, makeLength * 2))
    }
    // otherwise treat as utf8, pad or truncate to required length
    let s = input
    if (s.length < makeLength) s = s.padEnd(makeLength, '\0')
    if (s.length > makeLength) s = s.slice(0, makeLength)
    return CryptoJS.enc.Utf8.parse(s)
  }

  // key: try hex when length matches, else utf8-normalize to 16 bytes (AES-128)
  const keyWord = normalizeWord(keyStr, 16)
  const ivWord = normalizeWord(ivStr, 16)

  // parse cipher: try JSON wrapper { iv, value } -> value, else base64, else hex
  const parseCipher = (input: string) => {
    // JSON with possible fields
    try {
      const j = JSON.parse(input)
      if (j && (j.value || j.ciphertext || j.data)) {
        const val = j.value || j.ciphertext || j.data
        return { ciphertext: CryptoJS.enc.Base64.parse(val), ivFromCipher: j.iv }
      }
    } catch {
      // not json
    }

    // try base64
    try {
      return { ciphertext: CryptoJS.enc.Base64.parse(input), ivFromCipher: undefined }
    } catch {
      // try hex
      try {
        return { ciphertext: CryptoJS.enc.Hex.parse(input), ivFromCipher: undefined }
      } catch {
        return { ciphertext: null as any, ivFromCipher: undefined }
      }
    }
  }

  const parsed = parseCipher(cipherBase64)
  if (!parsed.ciphertext) {
    throw new Error('unsupported cipher format: expect base64/json(hex/base64) ciphertext')
  }

  // If iv embedded in cipher JSON and caller didn't explicitly pass iv, prefer embedded one
  let usedIv = ivWord
  if ((!ivStr || ivStr === '') && parsed.ivFromCipher) {
    usedIv = normalizeWord(parsed.ivFromCipher, 16)
  }

  try {
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: parsed.ciphertext })
    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWord, {
      iv: usedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // 尝试 UTF-8 文本
    try {
      const text = decrypted.toString(CryptoJS.enc.Utf8)
      if (text) return text
    } catch {
      // continue to fallbacks
    }

    // 若 UTF-8 为空或异常，尝试 Latin1（单字节）再 Hex
    try {
      const latin = decrypted.toString(CryptoJS.enc.Latin1)
      if (latin) return latin
    } catch {
      /* ignore */
    }

    return decrypted.toString(CryptoJS.enc.Hex)
  } catch (err: any) {
    // 更友好错误提示，便于排查 key/iv/格式问题
    throw new Error(
      `aes decrypt failed: ${(err && err.message) || err}. 可能的原因：key/iv 不匹配、iv 未提供或密文格式不正确。`
    )
  }
}
// ...existing code...
// ...existing code...
