import React from 'react'
import KeysProvider from './keys';
import IdentifiersProvider from './identifiers';


const Providers = (props: { children: React.ReactNode }) => {
    return (
        <KeysProvider>
            {/* <IdentifiersProvider> */}
                {props.children}
            {/* </IdentifiersProvider> */}
        </KeysProvider>                               
    );
}

export default Providers;

