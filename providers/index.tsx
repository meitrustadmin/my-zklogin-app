import React from 'react'
import KeysProvider from './keys';
import IdentifiersProvider from './identifiers';
import MultisigAddressProvider from './multisig';


const Providers = (props: { children: React.ReactNode }) => {
    return (
        <KeysProvider>
            <MultisigAddressProvider>
                {props.children}
            </MultisigAddressProvider>
        </KeysProvider>                               
    );
}

export default Providers;

