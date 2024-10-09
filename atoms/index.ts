import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils'
import { Keys } from 'types/index';


//export const identifiersAtom = atomWithStorage<any[] | undefined>('identifiers', undefined);

export const keysAtom = atomWithStorage<Keys | undefined>('keys', undefined);

export const identifiersAtom = atomWithStorage<any | null> (
    'identifiers',
    null,
    {
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => {
        if (value === null) {
          sessionStorage.removeItem(key);
        } else {
            let currentValue = sessionStorage.getItem(key);
            let updatedValue;
            if (!currentValue) {
                updatedValue = JSON.stringify([value]);
            } else {
                let parsedValue = JSON.parse(currentValue);
                if (Array.isArray(parsedValue)) {
                    if (!parsedValue.some(item => JSON.stringify(item) === JSON.stringify(value))) {
                        parsedValue.push(value);
                    }
                    updatedValue = JSON.stringify(parsedValue);
                } else {
                    if (JSON.stringify(parsedValue) !== JSON.stringify(value)) {
                        updatedValue = JSON.stringify([parsedValue, value]);
                    } else {
                        updatedValue = currentValue;
                    }
                }
                console.log('in atom setItem', updatedValue);
            }
            sessionStorage.setItem(key, updatedValue);
        }
      },
      removeItem: (key) => sessionStorage.removeItem(key),
    }
);