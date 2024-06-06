import { toNano, Address } from '@ton/core';
import { main } from '../wrappers/Exchange';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from "../utils/jetton-helpers";
import { JettonDefaultWallet as JettonWallet } from '../build/SampleJetton/tact_JettonDefaultWallet';
import fs from 'fs';

export async function run(provider: NetworkProvider) {
    let rawdata = fs.readFileSync('JettonAddress.json');
    const jettonAddress = Address.parse(JSON.parse(rawdata.toString()));

    const owner = provider.sender().address as Address;
    const exchange = provider.open(await main.fromInit(jettonAddress, owner));
    const exchange_jetton_wallet = provider.open(await JettonWallet.fromInit(jettonAddress, exchange.address));

    await exchange.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'SetMyJettonWallet',
            wallet: exchange_jetton_wallet.address,
        }
    );

    await provider.waitForDeploy(exchange.address);

    // run methods on `exchange`
}
