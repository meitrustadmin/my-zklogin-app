import React, {useEffect} from 'react';
import {getIdentifiers, getKeys} from '../local-storage';
import {useAtom} from 'jotai';
import {identifiersAtom, keysAtom} from '../atoms';

const IdentifiersProvider = (props: { children: React.ReactNode }) => {
    const [identifiers, setIdentifiers] = useAtom(identifiersAtom);

    useEffect(() => {
        // TODO: get identifiers from server and set them in identifiersAtom
        getIdentifiers().then(setIdentifiers);
    }, []);

    if (identifiers === undefined) return null; // Wait until we find keys from storage

    return <>
        {props.children}
    </>;
}

export default IdentifiersProvider;
