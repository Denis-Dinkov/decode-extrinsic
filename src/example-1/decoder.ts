import {
  Bytes,
  Codec,
  CodecType,
  Option,
  ScaleEnum,
  Struct,
  Tuple,
  V15,
  Vector,
  _void,
  bool,
  compact,
  compactNumber,
  enhanceDecoder,
  createCodec,
  enhanceCodec,
  createDecoder,
  str,
  u16,
  u32,
  u8,
} from "@polkadot-api/substrate-bindings"


import { Enum } from "scale-ts"

// Helper function to count trailing zeroes
function trailingZeroes(x) {
  if (x === 0) return 0;
  let count = 0;
  while ((x & 1) === 0) {
    count++;
    x >>= 1; // Divide by 2
  }
  return count;
}

const $version = enhanceCodec(
  u8,
  (value) => (+!!value.signed << 7) | value.version,
  (value) => ({
    version: value & ~(1 << 7),
    signed: !!(value & (1 << 7)),
  }),
)
// OLD => throwing an error "innerDecoder is not a function"
// const $multiAddress = Enum({
//   0: Bytes(32),
//   // FIXME: complete MultiAddress variants
// })

// NEW
const $multiAddress = Bytes(32);
const $multiSignature = Enum({
  0: Bytes(64), // Ed25519
  1: Bytes(64), // Sr25519
  2: Bytes(65), // Ecdsa
})
const $mortal = enhanceCodec(
  Bytes(2),
  (value) => {
    const factor = Math.max(value.period >> 12, 1)
    const left = Math.min(Math.max(trailingZeroes(value.period) - 1, 1), 15)
    const right = (value.phase / factor) << 4
    return u16.enc(left | right)
  },
  (value) => {
    const enc = u16.dec(value)
    const period = 2 << enc % (1 << 4)
    const factor = Math.max(period >> 12, 1)
    const phase = (enc >> 4) * factor
    return { type: "mortal", period, phase }
  },
)
const $mortality = createCodec(
  (value) => (value.type === "inmortal" ? u8.enc(0) : $mortal.enc(value)),
  createDecoder((value) => {
    const firstByte = u8.dec(value)
    if (firstByte === 0) return { type: "inmortal" }
    const secondByte = u8.dec(value)
    console.log({ firstByte, secondByte })
    return $mortal.dec(Uint8Array.from([firstByte, secondByte]))
  }),
)
const $extra = Struct({
  mortality: $mortality,
  nonce: compact,
  tip: compact,
})
const $call = Struct({
  module: u8,
  method: u8,
  // for a balances.transferKeepAlive(dest, value) arguments
  args: Struct({
    dest: $multiAddress,
    value: compact,
  }),
})
const $extrinsic = Struct({
  version: $version,
  // v4 Body
  body: Struct({
    sender: $multiAddress,
    // signature: $multiSignature,
    // extra: $extra,
    // call: $call,
  }),
})
export const $opaqueExtrinsic = enhanceCodec(Bytes(), $extrinsic.enc, $extrinsic.dec)
