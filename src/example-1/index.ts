import { createFullClient } from "@utils/client";
import { $opaqueExtrinsic } from "./decoder"
import { encodeAddress } from "@polkadot/util-crypto"

const example = async () => {
  const { rawClient, client } = await createFullClient()
  const historicBlockHash = '0x1847c19c9707baf1f1d0412abc7da57b68abca883d44da46e80870fda29e5e73'

  //get the block
  const historicBlock = await rawClient.request('chain_getBlock', [historicBlockHash])

  const blockExtrinsics = historicBlock.block.extrinsics

  //decode the extrinsic
  blockExtrinsics.forEach((extrinsic) => {
    const data = $opaqueExtrinsic.dec(extrinsic)
    console.log('Decoded data', data)
  })

};

export default example;
