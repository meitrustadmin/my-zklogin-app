


import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { identifiersAtom, multiSigAtom } from '../atoms';
import { checkAuthRecoveryExists } from '../utils';
import { useZkLoginSession } from 'lib/zklogin/client';
import router from 'next/router';
import { API_HOST } from 'lib/api/move';

const MultisigAddressProvider = (props: { children: React.ReactNode }) => {
    const {user} = useZkLoginSession();
    const [multisigAddress, setMultisigAddress] = useAtom(multiSigAtom)
    console.log('user?.identifier ' + user?.identifier)
    useEffect(() => {
        const fetchMultisigAddress = async () => {
            
            if (user && user.identifier) {
                const recoveries = await checkAuthRecoveryExists([user.identifier]);
                if (recoveries && recoveries.length === 1) {
                    console.log('multisig_address ' + recoveries[0].multisig_address)
                    setMultisigAddress(recoveries[0].multisig_address);
                } else {
                    setMultisigAddress(''); // No multisig address found
                    router.push(`${API_HOST}/recover`);
                }
            }

        };

       fetchMultisigAddress();
    }, [user?.identifier]);

    //if (multisigAddress === undefined) return null; // Wait until we've checked for the multisig address

    return <>{props.children}</>;
}

export default MultisigAddressProvider;

