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
import { encodeAddress } from "@polkadot/util-crypto"


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

// $version codec
const $version = enhanceCodec(
  u8,
  (value) => (+!!value.signed << 7) | value.version,
  (value) => ({
    version: value & ~(1 << 7),
    signed: !!(value & (1 << 7)),
  }),
)

// $multiAddress codec
const $multiAddress = Bytes(32);

// Updated $multiSignature codec
const $multiSignature = createCodec(
  (value) => {
    switch (value.type) {
      case 0:
        return Uint8Array.from([0, ...Bytes(64).enc(value.signature)]);
      case 1:
        return Uint8Array.from([1, ...Bytes(64).enc(value.signature)]);
      case 2:
        return Uint8Array.from([2, ...Bytes(65).enc(value.signature)]);
      default:
        throw new Error("Invalid signature type");
    }
  },
  createDecoder((input) => {
    const type = u8.dec(input);
    let signature;
    switch (type) {
      case 0:
        signature = Bytes(64).dec(input.slice(1));
        break;
      case 1:
        signature = Bytes(64).dec(input.slice(1));
        break;
      case 2:
        signature = Bytes(65).dec(input.slice(1));
        break;
      default:
        throw new Error("Invalid signature type");
    }
    return { type, signature };
  })
);

// $mortal codec
const $mortal = enhanceCodec(
  Bytes(2),
  (value) => {
    const factor = Math.max(value.period >> 12, 1);
    const left = Math.min(Math.max(trailingZeroes(value.period) - 1, 1), 15);
    const right = (value.phase / factor) << 4;
    return u16.enc(left | right);
  },
  (value) => {
    const enc = u16.dec(value);
    const period = 2 << (enc % (1 << 4));
    const factor = Math.max(period >> 12, 1);
    const phase = (enc >> 4) * factor;
    return { type: "mortal", period, phase };
  },
);

// $mortality codec
const $mortality = createCodec(
  (value) => (value.type === "inmortal" ? u8.enc(0) : $mortal.enc(value)),
  createDecoder((value) => {
    const firstByte = u8.dec(value);
    if (firstByte === 0) return { type: "inmortal" };
    const secondByte = u8.dec(value);
    console.log({ firstByte, secondByte });
    return $mortal.dec(Uint8Array.from([firstByte, secondByte]));
  }),
);

// $extra codec
const $extra = Struct({
  mortality: $mortality,
  nonce: compact,
  tip: compact,
});

// $call codec
const $call = Struct({
  module: u8,
  method: u8,
  args: Struct({
    value: compact,
  }),
});

// Define the AccountId codec
const $accountId = Bytes(32);

// $extrinsic codec
const $extrinsic = Struct({
  version: $version,
  body: Struct({
    sender: $accountId,
    extra: $extra,
    call: $call,
  }),
});

// $opaqueExtrinsic codec
export const $opaqueExtrinsic = enhanceCodec(Bytes(), $extrinsic.enc, $extrinsic.dec);
