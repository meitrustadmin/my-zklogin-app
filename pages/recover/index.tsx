import { getSuiVisionAccountUrl } from "lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH, RECOVER_PAGE_PATH } from "lib/zklogin/env";
//import { useSaveZkLoginLocalSession, useZkLoginSession } from "lib/zklogin/client/index";
import Link from "next/link";
import { Key, useEffect, useState } from "react";
import { toZkLoginPublicIdentifier } from '@mysten/sui/zklogin';
import { MultiSigPublicKey } from '@mysten/sui/multisig';
import {PublicKey, SignatureScheme, decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { useRouter } from "next/router";
import { withZkLoginSessionRequired } from "lib/zklogin/client";


// This is a publically accessible page, displaying optional contents for signed-in users.
export default withZkLoginSessionRequired( ({session} : {session: any}) => {
  const { user , isLoading } : { user: any, isLoading: boolean } = session;
  //const [identifiers, setIdentifiers] = useAtom(identifiersAtom);
  const [identifiers, setIdentifiers] = useState<any[]>([]);
  const [showRecover, setShowRecover] = useState(false);
  const [msAddress, setMsAddress] = useState<string>('');
  const [duplicate, setDuplicate] = useState<boolean>(false);
  const [used, setUsed] = useState<any>(null);
  const router = useRouter();



    // add identifier to session storage
    useEffect(() => {
      const storedIdentifiers = sessionStorage.getItem('identifiers');
      if (storedIdentifiers) { 
        const parsedIdentifiers = JSON.parse(storedIdentifiers);
        if (parsedIdentifiers.length > 0) {
          setIdentifiers(parsedIdentifiers)
        }
      }
      //console.log('user ', JSON.stringify(user))
        if (user) {
        // Check if this is the first time loading the page
            const isFirstLoad = sessionStorage.getItem('isFirstLoad') === null;
            //console.log('isFirstLoad', isFirstLoad)
            if (isFirstLoad) {
                const newIdentifier = {
                    provider: user.oidProvider,
                    identifier: user.identifier,
                    addressSeed: user.addressSeed,
                    iss: user.iss,
                    aud: user.id.aud,
                    keyClaimName: user.id.keyClaimName,
                    keyClaimValue: user.id.keyClaimValue,
                    address: user.wallet,
                    email: user.email,
                    picture: user.picture,
                    name: user.name,
                    index: identifiers?.length || 0,
                };
                // Set the flag in sessionStorage
                sessionStorage.setItem('isFirstLoad', 'false');
                // Push new identifier into session storage identifier array
                const storedIdentifiers = sessionStorage.getItem('identifiers');
                let updatedIdentifiers = [];

                if (storedIdentifiers) {
                    updatedIdentifiers = JSON.parse(storedIdentifiers);
                }

                // check if the identifier already exists in the session storage
                const identifierExists = updatedIdentifiers.some(
                    (item: any) => item.identifier === newIdentifier.identifier
                );
                // TODO check if the identifier already exists in the database
                if (identifierExists) {
                    setDuplicate(true);
                } else {
                    updatedIdentifiers.push(newIdentifier);
                    sessionStorage.setItem('identifiers', JSON.stringify(updatedIdentifiers));
                    setIdentifiers(updatedIdentifiers);
                }

                // const data = await checkAuthRecoveryExists(identifiersToSave)
                // console.log('data', data)
                // if (data && data.length > 0) {
                //     setUsed(data)
                //     return
                // }
                
            }
        };
    }, [user]);
  

    // useEffect(() => {
    //     const loadIdentifiersFromSessionStorage = () => {
    //         const storedIdentifiers = sessionStorage.getItem('identifiers');
    //         if (storedIdentifiers) {
    //         try {
    //             const parsedIdentifiers = JSON.parse(storedIdentifiers);
    //             setIdentifiers(parsedIdentifiers);
    //         } catch (error) {
    //             console.error('Error parsing identifiers from session storage:', error);
    //         }
    //         }
    //     };

    //     loadIdentifiersFromSessionStorage();
    // }, []);

    const handleAdd = () => {
        sessionStorage.removeItem('isFirstLoad');
        router.push('/authzk/login')
    }
    const checkAuthRecoveryExists = async (identifiers: string[]) => {
        try {
            const response = await fetch('/api/recover/getbyidentifiers', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifiers }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data
        } catch (error) {
            console.error('Error checking auth recovery:', error);
        }
    };

    async function toMultisigAddress(): Promise<void> {
        let pks: { publicKey: PublicKey; weight: number }[] = [];
        let identifiersToSave: string[] = []
        identifiers.map(i => identifiersToSave.push(i.identifier))
        // const storedIdentifiers = sessionStorage.getItem('identifiers');
        // if (storedIdentifiers) {
        //   identifiersToSave = JSON.parse(storedIdentifiers);
        //   //storedIdentifiers.map(i => identifiersToSave.push(i.identifier))
        // }
        const data = await checkAuthRecoveryExists(identifiersToSave)
        console.log('data', data)
        if (data && data.length > 0) {
            setUsed(data)
            return
        }
        identifiers.forEach((item: any) => {
            let pk = toZkLoginPublicIdentifier(
                BigInt(item.addressSeed),
                item.iss,
            )
            //const pk = toPkIdentifier(item);
            pks.push({ publicKey: pk, weight: 1 });
        });

        const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
            threshold: 1,
            publicKeys: pks
        });
        //console.log(multiSigPublicKey.toSuiAddress());
        //user?.multisigAddress = multiSigPublicKey.toSuiAddress();setMsAddress
        console.log('multiSigPublicKey raw bytes', multiSigPublicKey.toRawBytes());

        const msAddressRawBase64 = btoa(String.fromCharCode.apply(null, Array.from(multiSigPublicKey.toRawBytes())));

        setMsAddress(multiSigPublicKey.toSuiAddress());
        try {
            const response = await fetch('/api/recover/create', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({identifiers: identifiers, msAddress: multiSigPublicKey.toSuiAddress(), msAddressRaw: msAddressRawBase64})
            });

            if (!response.ok) {
                throw new Error('Failed to create recovery');
            }

            const result = await response.json();
            setIdentifiers([]);
            sessionStorage.removeItem('identifiers');
            sessionStorage.removeItem('isFirstLoad');
            console.log('Recovery created:', result);
            router.push('/passkey')
        } catch (error) {
        console.error('Error creating recovery:', error);
        }
    }

    const handleDelete = (identifierToDelete: string) => {
        //console.log('identifierToDelete', identifierToDelete);
        const storedIdentifiers = sessionStorage.getItem('identifiers');
        //console.log('storedIdentifiers before deletion:', storedIdentifiers);
        
        if (storedIdentifiers) {
            let updatedIdentifiers = JSON.parse(storedIdentifiers);
            //console.log('updatedIdentifiers before deletion:', updatedIdentifiers);
            
            updatedIdentifiers = updatedIdentifiers.filter((item: any) => item.identifier !== identifierToDelete);
            //console.log('updatedIdentifiers after deletion:', updatedIdentifiers);
            
            sessionStorage.setItem('identifiers', JSON.stringify(updatedIdentifiers));
            setIdentifiers(updatedIdentifiers);
            setDuplicate(false)
            setUsed(null)
        }
    };

    const handleSignOut = () => {
        sessionStorage.removeItem('isFirstLoad')
        sessionStorage.removeItem('identifiers')
        //setIdentifiers([])
        router.push(`${AUTH_API_BASE}/logout`)
    }

  if (isLoading) return <p>Loading zkLogin session...</p>;

  if (user) {
    // Signed-in experience.
    return (
    <>
        <h3>
          current session provider: {user.oidProvider}
        </h3>
        <h3>
          current session identifier: {JSON.stringify(user.identifier)}
        </h3>
        
        {/* <div>
          <Link href={getSuiVisionAccountUrl(user.wallet)} target="_blank">
            My zkLogin wallet address
          </Link>
        </div> */}
        <div>
            
            {/* {typeof(JSON.stringify(identifiers))} */}
            {/* {JSON.stringify(identifiers)} */}
            {duplicate ? <h3 className="mt-5 text-red-500">{user.oidProvider} {user.email} already added</h3> : null}
            {used && used.length > 0 ? (
              used.map((use: any, index: any) => (
                <p key={index} className="mt-5">Identifier: {use.identifier} Used By Address: {use.multisig_address}</p>
              ))
            ) : null}
            {identifiers.length > 0 ? (
              <ul>
                {identifiers.map((identifier: any, index: any) => (
                <>
                 <li key={index}>
                    <p>Provider: {identifier.provider}</p>
                    <p>Email: {identifier.email}</p>
                    {/* {identifier.picture && <img src={identifier.picture} width={100} height={100} className="rounded-full"/>} */}
                    <p>Picture: {identifier.picture}</p>
                    {/* <img src="https://lh3.googleusercontent.com/a/ACg8ocIv5Hkus7DuuncBhNULGJcbLuKGP82RYyH4FrHyjqq0NO6TmXs_=s96-c" width={100} height={100}/> */}
                    <p>Full Name: {identifier.name}</p>
                    {/* <p>Given Name: {identifier.given_name}</p>
                    <p>Family Name: {identifier.family_name}</p> */}
                    <p>Identifier: {identifier.identifier}</p>
                    <p>Address: {identifier.address}</p>
                  </li>
                  <button onClick={() => handleDelete(identifier.identifier)}>Delete</button>
                </>
                 
                ))}
              </ul>
            ) : (
              <p>No identifiers available</p>
            )}
        </div>
        <div>
          Multisig Address: {msAddress}
        </div>
        <div className="flex flex-1 flex-row gap-x-2" >
          <div>
              <button onClick={handleAdd}>Add recovery</button>
          </div>
          { identifiers.length < 3 ? 
            (<div>
              <button disabled>To multisig disable</button>
            </div>): (<div>
              <button onClick={toMultisigAddress}>To multisig</button>
            </div>)
          }
        </div>

        {/* <div>
          <Link href={RECOVER_PAGE_PATH}>Recover</Link>
        </div> */}
        {/* <div>
          <Link href="/protected">Sui calculator</Link>
        </div> */}
         <div>
          <button onClick={() => router.push('/passkey/create')}>Passkey</button>
        </div>
        <div>
          {/* <Link href={`${AUTH_API_BASE}/logout`}>Sign out</Link> */}
          <button onClick={handleSignOut}>Sign out</button>
        </div>
       
    </>
    );
  } else {

    if (identifiers.length > 0) {
      return (
        <>
          <ul>
              {identifiers.map((identifier: any, index: any) => (
              <>
              <li key={index}>
                  <p>Provider: {identifier.provider}</p>
                  <p>Email: {identifier.email}</p>
                  {/* {identifier.picture && <img src={identifier.picture} width={100} height={100} className="rounded-full"/>} */}
                  <p>Picture: {identifier.picture}</p>
                  {/* <img src="https://lh3.googleusercontent.com/a/ACg8ocIv5Hkus7DuuncBhNULGJcbLuKGP82RYyH4FrHyjqq0NO6TmXs_=s96-c" width={100} height={100}/> */}
                  <p>Full Name: {identifier.name}</p>
                  {/* <p>Given Name: {identifier.given_name}</p>
                  <p>Family Name: {identifier.family_name}</p> */}
                  <p>Identifier: {identifier.identifier}</p>
                  <p>Address: {identifier.address}</p>
                </li>
                <button onClick={() => handleDelete(identifier.identifier)}>Delete</button>
              </>
              ))}
          </ul>
          <div>
              <button onClick={handleAdd}>Add recovery</button>
          </div>
        </>) 
      } else {
        return (
          <>
            <h1>Hello, anonymous user!</h1>
            <div>
              <Link href={LOGIN_PAGE_PATH}>Continue with social account</Link>
            </div>
            
          </>
        );
      }

  }
})


