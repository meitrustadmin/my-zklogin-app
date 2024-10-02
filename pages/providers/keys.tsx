import React, {useEffect} from 'react';
import {getKeys} from '../local-storage/index';
import {useAtom} from 'jotai';
import {keysAtom} from '../atoms/index';

const KeysProvider = (props: { children: React.ReactNode }) => {
    const [keys, setKeys] = useAtom(keysAtom);

    useEffect(() => {
        getKeys().then(setKeys);
    }, []);

    if (keys === undefined) return null; // Wait until we find keys from storage

    return <>
        {props.children}
    </>;
}

export default KeysProvider;
