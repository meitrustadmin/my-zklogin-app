import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';
import {DEFAULT_RELAYS, PLATFORM} from 'const';
import {Keys, RelayDict} from '../types/index';

const isCapacitor = PLATFORM === 'ios' || PLATFORM === 'android';

const getSessionItem = async (key: string): Promise<any | null> => {
    let valueRaw: any;

    if (PLATFORM === 'web') {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            valueRaw = window.sessionStorage.getItem(key);
        }
    } else {
        throw new Error('Not implemented for non-web platforms');
    }

    if (valueRaw !== null) {
        try {
            return JSON.parse(valueRaw);
        } catch (e) {
            return valueRaw;
        }
    }

    return null;
}


const getItem = async (key: string): Promise<any | null> => {
    let valueRaw: any;

    if (isCapacitor) {
        try {
            valueRaw = await SecureStoragePlugin.get({key}).then((a: any) => a.value);
        } catch (e) {
            valueRaw = null;
        }
    } else if (PLATFORM === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
            valueRaw = window?.localStorage?.getItem(key);
        }
        
    } else {
        throw new Error('Not implemented');
    }

    if (valueRaw !== null) {
        try {
            return JSON.parse(valueRaw);
        } catch (e) {

        }
    }

    return null;
}

const setSessionItem = async (key: string, value: any): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.set({key, value: JSON.stringify(value)});
    } else if (PLATFORM === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    } else {
        throw new Error('Not implemented');
    }
}

const setItem = async (key: string, value: any): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.set({key, value: JSON.stringify(value)});
    } else if (PLATFORM === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } else {
        throw new Error('Not implemented');
    }
}

const removeItem = async (key: string): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.remove({key});
    } else if (PLATFORM === 'web') {
        localStorage.removeItem(key);
    } else {
        throw new Error('Not implemented');
    }
}

const removeSessionItem = async (key: string): Promise<void> => {
    if (isCapacitor) {
        await SecureStoragePlugin.remove({key});
    } else if (PLATFORM === 'web') {
        sessionStorage.removeItem(key);
    } else {
        throw new Error('Not implemented');
    }
}

export const getIdentifiers = async (): Promise<any[]> => getSessionItem('identifiers');
export const storeIdentifiers = async (identifiers: any[]): Promise<void> => setSessionItem('identifiers', identifiers);
export const removeIdentifiers = async (): Promise<void> => removeSessionItem('identifiers');

export const getKeys = async (): Promise<Keys> => getItem('keys');
export const storeKeys = async (keys: Keys): Promise<void> => setItem('keys', keys);

export const removeNostr = async (): Promise<void> => removeItem('nostr');
export const removeJoyId = async (): Promise<void> => removeItem('ccc-joy-id-signer');
export const getRelays = (): Promise<RelayDict> => getItem('relays').then(r => r || DEFAULT_RELAYS);
export const getRelaysNullable = (): Promise<RelayDict | null> => getItem('relays');
export const storeRelays = async (relays: RelayDict) => setItem('relays', relays);
export const removeRelays = async (): Promise<void> => removeItem('relays');

// Skipping using capacitor secure plugin for storing editor history and putting function here to have a clear structure for local storage.
export const getEditorValue = (key: string) => localStorage.getItem(key);
export const storeEditorValue = (key: string, value: string) => localStorage.setItem(key, value);
export const removeEditorValue = (key: string) => localStorage.removeItem(key);