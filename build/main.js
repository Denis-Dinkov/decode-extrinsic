var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};

// src/example-1/index.ts
var example_1_exports = {};
import {
  Bytes,
  Struct,
  compact,
  createCodec,
  enhanceCodec,
  createDecoder,
  u16,
  u8
} from "@polkadot-api/substrate-bindings";
import { Enum } from "scale-ts";
function trailingZeroes(x) {
  if (x === 0) return 0;
  let count = 0;
  while ((x & 1) === 0) {
    count++;
    x >>= 1;
  }
  return count;
}
var $version, $multiAddress, $multiSignature, $mortal, $mortality, $extra, $call, $extrinsic, $opaqueExtrinsic, extrinsic;
var init_example_1 = __esm({
  "src/example-1/index.ts"() {
    "use strict";
    $version = enhanceCodec(
      u8,
      (value) => +!!value.signed << 7 | value.version,
      (value) => ({
        version: value & ~(1 << 7),
        signed: !!(value & 1 << 7)
      })
    );
    $multiAddress = Bytes(32);
    $multiSignature = Enum({
      0: Bytes(64),
      // Ed25519
      1: Bytes(64),
      // Sr25519
      2: Bytes(65)
      // Ecdsa
    });
    $mortal = enhanceCodec(
      Bytes(2),
      (value) => {
        const factor = Math.max(value.period >> 12, 1);
        const left = Math.min(Math.max(trailingZeroes(value.period) - 1, 1), 15);
        const right = value.phase / factor << 4;
        return u16.enc(left | right);
      },
      (value) => {
        const enc = u16.dec(value);
        const period = 2 << enc % (1 << 4);
        const factor = Math.max(period >> 12, 1);
        const phase = (enc >> 4) * factor;
        return { type: "mortal", period, phase };
      }
    );
    $mortality = createCodec(
      (value) => value.type === "inmortal" ? u8.enc(0) : $mortal.enc(value),
      createDecoder((value) => {
        const firstByte = u8.dec(value);
        if (firstByte === 0) return { type: "inmortal" };
        const secondByte = u8.dec(value);
        console.log({ firstByte, secondByte });
        return $mortal.dec(Uint8Array.from([firstByte, secondByte]));
      })
    );
    $extra = Struct({
      mortality: $mortality,
      nonce: compact,
      tip: compact
    });
    $call = Struct({
      module: u8,
      method: u8,
      // for a balances.transferKeepAlive(dest, value) arguments
      args: Struct({
        // dest: Bytes(32),
        value: compact
      })
    });
    $extrinsic = Struct({
      version: $version,
      // v4 Body
      body: Struct({
        // sender: $multiAddress,
        // signature: $multiSignature,
        // extra: $extra,
        call: $call
      })
    });
    $opaqueExtrinsic = enhanceCodec(Bytes(), $extrinsic.enc, $extrinsic.dec);
    extrinsic = $opaqueExtrinsic.dec("0x280403000b906fdaed9001");
    console.log(extrinsic);
  }
});

// src/main.ts
var args = process.argv.slice(2);
var example = args[0];
var examplesMap = {
  "1": () => Promise.resolve().then(() => (init_example_1(), example_1_exports))
};
if (example in examplesMap) {
  examplesMap[example]().then((module) => {
    if (module.default) {
      module.default();
    } else {
      console.log("Module loaded:", module);
    }
  }).catch((err) => {
    console.error("Error loading module:", err);
  });
} else {
  console.log("Invalid example number. Please provide a valid number (1, 2).");
}
//# sourceMappingURL=main.js.map
