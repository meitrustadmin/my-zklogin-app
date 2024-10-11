


import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { identifiersAtom, multiSigAtom } from '../atoms';
import { checkAuthRecoveryExists } from '../utils';
import { useZkLoginSession } from 'lib/zklogin/client';

const MultisigAddressProvider = (props: { children: React.ReactNode }) => {
    const {user} = useZkLoginSession();
    const [multisigAddress, setMultisigAddress] = useAtom(multiSigAtom)

    useEffect(() => {
        const fetchMultisigAddress = async () => {
            console.log(user?.identifier)
            if (user && user.identifier) {
                const recoveries = await checkAuthRecoveryExists([user.identifier]);
                if (recoveries && recoveries.length === 1) {
                    //console.log(recoveries[0].multisig_address)
                    setMultisigAddress(recoveries[0].multisig_address);
                } else {
                    setMultisigAddress(''); // No multisig address found
                }
            }

        };

       fetchMultisigAddress();
    }, [user?.identifier]);

    //if (multisigAddress === undefined) return null; // Wait until we've checked for the multisig address

    return <>{props.children}</>;
}

export default MultisigAddressProvider;

