import { getSuiVisionAccountUrl } from "lib/hooks/sui";
import { AUTH_API_BASE, LOGIN_PAGE_PATH, RECOVER_PAGE_PATH } from "lib/zklogin/env";
//import { useSaveZkLoginLocalSession, useZkLoginSession } from "lib/zklogin/client/index";
import Link from "next/link";
import { fromB64, toB64 } from '@mysten/sui/utils';
import { identifiersAtom } from "../atoms";
import { useAtom } from "jotai";
import { Key, useEffect, useState } from "react";
import { toZkLoginPublicIdentifier } from '@mysten/sui/zklogin';
import { MultiSigPublicKey } from '@mysten/sui/multisig';
import {PublicKey, SignatureScheme, decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { useRouter } from "next/router";
import { useZkLoginSession, useSaveZkLoginLocalSession } from "lib/zklogin/client/hooks/session";
import axios from 'axios';
import { stringToArray } from "../utils";
import { API_HOST } from "lib/api/move";


// This is a publically accessible page, displaying optional contents for signed-in users.
export default function Index() {
  const session = useZkLoginSession();
  const { user , isLoading } : { user: any, isLoading: boolean } = session;
  //const [identifiers, setIdentifiers] = useAtom(identifiersAtom);
  const [identifiers, setIdentifiers] = useState<any[]>([]);
  const [showRecover, setShowRecover] = useState(false);
  const [msAddress, setMsAddress] = useState<string>('');
  const [duplicate, setDuplicate] = useState<boolean>(false);
  const [used, setUsed] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/recover');
    }
  }, [user]);

 
    const handleSignOut = () => {
        sessionStorage.removeItem('isFirstLoad')
        sessionStorage.removeItem('identifiers')
        //setIdentifiers([])
        router.push(`${AUTH_API_BASE}/logout`)
    }

  if (isLoading) return <p>Loading zkLogin session...</p>;

  return (
    <>
      <h1>Hello, anonymous user!</h1>
      <div>
        <Link href={LOGIN_PAGE_PATH}>Continue with social account</Link>
      </div>
      
    </>
  );

  // if (user) {
  //   // Signed-in experience.
  //   return (
  //   <>
  //       <h1>Hello, {user.oidProvider} user!</h1>
  //       {/* <div>
  //         <Link href={getSuiVisionAccountUrl(user.wallet)} target="_blank">
  //           My zkLogin wallet address
  //         </Link>
  //       </div> */}
  //       <div>
  //         Current provider: {user.oidProvider}
  //         Curent ZK Identifier: {user.identifier}
  //       </div>
  //       <div>
  //         Multisig Address: {msAddress}
  //       </div>
  //       {identifiers.length > 0 ? (
  //             <ul>
  //               {identifiers.map((identifier: any, index: any) => (
  //               <>
  //                <li key={index}>
  //                   <p>Provider: {identifier.provider}</p>
  //                   <p>Email: {identifier.email}</p>
  //                   {/* {identifier.picture && <img src={identifier.picture} width={100} height={100} className="rounded-full"/>} */}
  //                   <p>Picture: {identifier.picture}</p>
  //                   {/* <img src="https://lh3.googleusercontent.com/a/ACg8ocIv5Hkus7DuuncBhNULGJcbLuKGP82RYyH4FrHyjqq0NO6TmXs_=s96-c" width={100} height={100}/> */}
  //                   <p>Full Name: {identifier.name}</p>
  //                   {/* <p>Given Name: {identifier.given_name}</p>
  //                   <p>Family Name: {identifier.family_name}</p> */}
  //                   <p>Identifier: {identifier.identifier}</p>
  //                   <p>Address: {identifier.address}</p>
  //                 </li>
  //                 <button onClick={() => handleDelete(identifier.identifier)}>Delete</button>
  //               </>
                 
  //               ))}
  //             </ul>
  //           ) : (
  //             <p>No identifiers available</p>
  //           )}
  //       <div>
  //           <button onClick={handleAdd}>Add recovery</button>
  //       </div>
  //       {/* {showRecover && (
  //         <div>
  //           <Recover/>
  //         </div>
  //       )} */}
  //       { identifiers.length < 3 ? 
  //         (<div>
  //           <button disabled>To multisig disable</button>
  //         </div>): (<div>
  //           <button onClick={toMultisigAddress}>To multisig</button>
  //         </div>)
  //       }
  //       {/* <div>
  //         <Link href={RECOVER_PAGE_PATH}>Recover</Link>
  //       </div> */}
  //       {/* <div>
  //         <Link href="/protected">Sui calculator</Link>
  //       </div> */}
  //       <div>
  //         <Link href="/passkey/create">Create passkey</Link>
  //       </div>
  //       <div>
  //         <button onClick={handleSignOut}>Sign out</button>
  //       </div>
  //   </>
  //   );
  // } else {
  //   // Anonymous experience.
  //   return (
  //     <>
  //       <h1>Hello, anonymous user!</h1>
  //       <div>
  //         <Link href={LOGIN_PAGE_PATH}>Continue with social account</Link>
  //       </div>
        
  //     </>
  //   );
  // }
}


