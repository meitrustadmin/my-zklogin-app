import { useEffect, useState } from "react";

import { generatePrivateKey, getPublicKey } from "nostr-tools";
import OtpInput from 'react-otp-input';
import { useRouter } from "next/router";

export default function Nostr() {

  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<boolean>(false);
  const [decrypt, setDecrypt] = useState<boolean>(false);
  const [otp, setOtp] = useState('');
  const [doubleOtp, setDoubleOtp] = useState('');
  const [decryptOtp, setDecryptOtp] = useState('');
  const [encryptedPrivateKey, setEncryptedPrivateKey] = useState<string | null>(null);
  const [iv, setIv] = useState<string | null>(null);
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<string | null>(null);
  const router = useRouter();

//   useEffect(() => {
//     const privateKey = generatePrivateKey();
//     const publicKey = getPublicKey(privateKey);
//     setPrivateKey(privateKey);
//     setPublicKey(publicKey);
//     // const privateKey = sessionStorage.getItem('privateKey');
//     // const publicKey = sessionStorage.getItem('publicKey');
//     // setPrivateKey(privateKey);
//     // setPublicKey(publicKey);
//   }, []);

  const encypt = async () => {
    if (Number(doubleOtp) !== Number(otp)) {
        alert("Double OTP does not match");
        return;
    }
    if (privateKey && otp) {
        if (otp.length !== 6) {
            alert("Please enter a 6-digit recovery PIN.");
            return;
        }
        // const key = Buffer.from(
        //     otp.padEnd(32, '0')
        //   ).toString('base64');
        const key =  new TextEncoder().encode(otp.padEnd(32, '0'))
        const keyString = Buffer.from(key).toString('base64');
        try {
            const {ciphertext, iv} = await encryptSymmetric(privateKey, keyString);
            setEncryptedPrivateKey(ciphertext);
            setIv(iv);
        } catch (error) {
            console.error("Encryption failed:", error);
            alert("Encryption failed. Please try again.");
        }
    } else {
        alert("Please generate a private key and enter a 6-digit recovery PIN first.");
    }
    setRecovery(false);
    //setOtp('');
  }

  const encryptSymmetric = async (plaintext: string, key: string) => {
    // create a random 96-bit initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
  
    // encode the text you want to encrypt
    const encodedPlaintext = new TextEncoder().encode(plaintext);
  
    // prepare the secret key for encryption
    const secretKey = await crypto.subtle.importKey('raw', Buffer.from(key, 'base64'), {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);
  
    // encrypt the text with the secret key
    const ciphertext = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv
    }, secretKey, encodedPlaintext);
    
    // return the encrypted text "ciphertext" and the IV
    // encoded in base64
    return ({
        ciphertext: Buffer.from(ciphertext).toString('base64'),
        iv: Buffer.from(iv).toString('base64')
    });
  }

  const decryptSymmetric = async (ciphertext: string, iv: string, key: string) => {
    // prepare the secret key
    const secretKey = await crypto.subtle.importKey(
        'raw',
        Buffer.from(key, 'base64'), 
        {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']);
  
    // decrypt the encrypted text "ciphertext" with the secret key and IV
    const cleartext = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: Buffer.from(iv, 'base64'),
    }, secretKey, Buffer.from(ciphertext, 'base64'));
  
    // decode the text and return it
    return new TextDecoder().decode(cleartext);
  }

  const decrypt2 = async () => {
    console.log('encryptedPrivateKey', encryptedPrivateKey)
    console.log('iv', iv)
    console.log('otp', otp)
    if (Number(decryptOtp) !== Number(otp)) {
        alert("Recovery PIN not correct");
        return;
    }
    if (encryptedPrivateKey && iv && otp && decryptOtp) {
        const key = Buffer.from(
            decryptOtp.padEnd(32, '0')
          ).toString('base64');
        try {
            const decryptedPrivateKey = await decryptSymmetric(encryptedPrivateKey, iv, key);
            setDecryptedPrivateKey(decryptedPrivateKey);
        } catch (error) {
            console.error("Decryption failed:", error);
            alert("Decryption failed. Please try again.");
        }
    }

  }

  return (
    <div>
        <h1>Nostr</h1>
        <button onClick={() => {
            const privateKey = generatePrivateKey();
            const publicKey = getPublicKey(privateKey);
            setPrivateKey(privateKey);
            setPublicKey(publicKey);
        }}>Generate</button>
        <div>
            <h3>Private Key: {privateKey}</h3>
            <h3>Public Key: {publicKey}</h3>
        </div>
        <button onClick={() => {
            setRecovery(true)
        }}>Add Recovery PIN</button>
        {recovery && (
            <div>
                <h3>Recovery PIN: </h3>
                <OtpInput
                    value={otp}
                    onChange={(otp) => setOtp(otp)}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                />
                <OtpInput
                    value={doubleOtp}
                    onChange={(otp) => setDoubleOtp(otp)}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                />
                <button onClick={encypt}>Encrypt</button>
            </div>
        )}
        {/* {encryptedPrivateKey && ( */}
            <div>
                <h3>Encrypted Private Key: {encryptedPrivateKey}</h3>
            </div>
        {/* )} */}
        <button onClick={() => {setDecrypt(true)}}>Decrypt</button>
        {decrypt && (
            <div>
                <OtpInput
                    value={decryptOtp}
                    onChange={(decryptOtp) => setDecryptOtp(decryptOtp)}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} />}
                />
                <button onClick={decrypt2}>
                    Confirm
                </button>
            </div>
        )}
        {decryptedPrivateKey && (
            <div>
                    
                <h3>Decrypted Private Key: {decryptedPrivateKey}</h3>
            </div>
        )}
        <button onClick={() => router.push('/passkey/verify')}>Next</button>
    </div>
  );
}   