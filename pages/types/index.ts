

export type SyntheticPrivKey = 'nip07' | 'none';
export type PrivKey = string | SyntheticPrivKey;

export type Keys = {
    pub: string;
    priv: string;
} | {
    pub: string;
    priv: SyntheticPrivKey;
} | null;

export type Platform = 'web' | 'ios' | 'android'


export type RelayDict = Record<string, { read: boolean; write: boolean }>;