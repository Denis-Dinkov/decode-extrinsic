import {
  dot,
  rococo,
} from '@polkadot-api/descriptors';
import { chainSpec as polkadotChainSpec } from 'polkadot-api/chains/polkadot';
import { chainSpec as rococoChainSpec } from 'polkadot-api/chains/rococo_v2_2';

import { createClient } from 'polkadot-api';
import { start } from "polkadot-api/smoldot";
import { getSmProvider } from 'polkadot-api/sm-provider';

import { WebSocketProvider } from 'polkadot-api/ws-provider/node'
import { getObservableClient } from '@polkadot-api/observable-client'
import { createClient as createSubstrateClient } from '@polkadot-api/substrate-client'

// web imports for worker
// import { startFromWorker } from "polkadot-api/smoldot/from-worker";
// import SmWorker from "polkadot-api/smoldot/worker?worker";

export const createLightClient = async () => {
  // usage in web
  // const smoldot = startFromWorker(new SmWorker());
  const smoldot = start();

  const chain = await smoldot.addChain({
    // chainSpec: rococoChainSpec,
    // or any other well known chainSpec
    chainSpec: polkadotChainSpec,
  });

  const client = createClient(
    getSmProvider(chain),
  );

  const api = client.getTypedApi(dot);

  return { client, api }
}

export const createFullClient = async () => {
  // for more endpoints you can look in here https://github.com/polkadot-js/apps/tree/master/packages/apps-config/src/endpoints
  const rawClient = createSubstrateClient(WebSocketProvider('wss://polkadot-rpc.publicnode.com'));
  const client = getObservableClient(rawClient);

  return { rawClient, client }
}
