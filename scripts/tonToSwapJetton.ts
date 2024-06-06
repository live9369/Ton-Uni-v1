import { toNano, Address, beginCell,  } from '@ton/core';
import { main } from '../wrappers/Exchange';
import { JettonDefaultWallet as JettonWallet } from '../build/SampleJetton/tact_JettonDefaultWallet';
import { NetworkProvider } from '@ton/blueprint';
import fs from 'fs';

export async function run(provider: NetworkProvider) {
    let rawdata = fs.readFileSync('JettonAddress.json');
    const jettonAddress = Address.parse(JSON.parse(rawdata.toString()));
    
    const user = provider.sender().address as Address;
    const exchange = provider.open(await main.fromInit(jettonAddress, user));
    const jettonWallet = provider.open(await JettonWallet.fromInit(jettonAddress, exchange.address));
    
    let sender = user;
    let tonAmount = toNano('0.5');
    await exchange.send(
        provider.sender(),
        {
            value: tonAmount,
            bounce: true,

        },
        {
            $$type: 'TonToSwapJetton',
            sender: sender,
            queryId: 1n,
        }
    );

    await provider.waitForDeploy(jettonWallet.address);

    // run methods on `exchange`
}

function cell(pram: string) {
    return beginCell().storeBit(1).storeUint(0, 32).storeStringTail(pram).endCell();
}