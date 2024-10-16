import { FormEvent, Fragment, useEffect, useState } from "react";
import { supported, create } from "@github/webauthn-json";
import { withIronSessionSsr } from "iron-session/next";
import { generateChallenge, isLoggedIn } from "lib/auth";
import { sessionOptions } from "lib/session";
import { useRouter } from "next/router";
import { API_HOST, RPID } from "lib/api/move";
import { useZkLoginSession, withZkLoginSessionRequired } from "lib/zklogin/client";
import { GetServerSideProps } from "next";
import { AUTH_API_BASE } from "lib/zklogin/env";
import Link from "next/link";
import { useAtom } from "jotai";
import { multiSigAtom } from "atoms";

// export const getServerSideProps: GetServerSideProps = async (context: any) => {
//   const challenge = generateChallenge();
//   req.session.challenge = challenge;
//   await req.session.save();

//   return { props: { challenge } };
// }

// export const getServerSideProps = withIronSessionSsr(async function ({
//   req,
//   res,
// }) {
//   // if (isLoggedIn(req)) {
//   //   return {
//   //     redirect: {
//   //       destination: "/admin",
//   //       permanent: false,
//   //     },
//   //   };
//   // }

//   const challenge = generateChallenge();
//   req.session.challenge = challenge;
//   await req.session.save();

//   return { props: { challenge } };
// }, sessionOptions);

function Create({ session } : { session: any }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayname, setDisplayname] = useState("");
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const { user, isLoading, localSession } = session;
  const [multisigAddress] = useAtom(multiSigAtom)

  // console.log('user?.identifier ' + user?.identifier)
  
  // console.log('multisigAddress ' + multisigAddress)

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
      
    };
    checkAvailability();
  }, []);


  useEffect(() => {
    const createChallenge = () => {
      const challenge = generateChallenge();
      sessionStorage.setItem("challenge", challenge);
      setChallenge(challenge);
    }
    createChallenge();
  }, [])

  useEffect(() => {
    const fetchPasskeys = async () => {
      const response = await fetch('/api/passkey/getbyaddress', {
        method: 'POST',
        body: JSON.stringify({ multisigAddress }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('passkeys', data);
      setPasskeys(data);
    };
    fetchPasskeys();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Check if username is already in use
    const usernameCheckResponse = await fetch("/api/auth/getbyusername", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    //console.log('usernameCheckResponse', usernameCheckResponse);
    
    const user = await usernameCheckResponse.json();
    if (!usernameCheckResponse.ok) {
      setError(user.message);
      return;
    }
    if (user) {
      setError("Username already in use");
      return;
    }
    console.log('RP ID ', JSON.stringify(RPID))
    const credential = await create({
      publicKey: {
        challenge: challenge as string,
        rp: {
          name: "next-webauthn",
          // TODO: Change
          id: RPID
        },
        user: { 
          id: window.crypto.randomUUID(),
          name: username,
          displayName: displayname,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
      },
    });

    const result = await fetch("/api/auth/create", {
      method: "POST",
      body: JSON.stringify({ displayname, username, credential, challenge, multisigAddress }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    //console.log('result', result);
    const data = await result.json();
    console.log('data', data);
    if (result.ok) {
      //setFinished(true);
      window.location.href = '/nostr';
      // Get WebAuthn credentials list
      
      // const credentialsList = await navigator.credentials.get({
      //   mediation: "silent",
      //   publicKey: {
      //     challenge: new Uint8Array(32), // You might want to use a proper challenge here
      //     userVerification: "discouraged",
      //     rpId: 'localhost', // Make sure this matches your Relying Party ID
      //   }
      // });

      // console.log('WebAuthn credentials:', credentialsList);

      // You might want to send this list to your server or process it further
      //router.push("/admin");
    } else {
      const { message } = await result.json();
      setError(message);
    }
  };
  const handleSignOut = () => {
    sessionStorage.removeItem('isFirstLoad')
    sessionStorage.removeItem('identifiers')
    //setIdentifiers([])
    router.push(`${AUTH_API_BASE}/logout`)
}

  return (
    <Fragment>
      <h1>Create Passkey</h1>
      <p>Multisig Address: {multisigAddress}</p>
      <ul>
      <h3>Passkeys List in DB</h3>
      {passkeys.length > 0 ? passkeys.map((passkey) => (
        <li key={passkey.id} className="flex flex-row">
          <div className="px-5">id: {passkey.id}</div>
          <div className="px-5">username: {passkey.username}</div>
          <div className="px-5">displayname: {passkey.displayname}</div>
        </li>
      )) : <p>No passkeys found</p>}
      </ul>

      {isAvailable ? (
        <form method="POST" onSubmit={onSubmit}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setFinished(false)
              setError('')
            }}
          />
          <input
            type="text"
            id="displayName"
            name="displayName"
            placeholder="Display Name"
            value={displayname}
            onChange={(event) => {
              setDisplayname(event.target.value) 
              setFinished(false)
              setError('')}}
          />
          <input type="submit" value="Create Passkey" />
          {error != null ? <pre>{error}</pre> : null}
        </form>
      ) : (
        <p>Sorry, webauthn is not available.</p>
      )}
        <div>
          <Link href="/passkey/verify">Next</Link>
        </div>
      
      <div>
          <button onClick={handleSignOut}>Sign out</button>
      </div>
      {finished ? <p>Registration successful!</p> : null}
      <Link href="/recover">Back To Home</Link>
      {/* <div>
        {passkeys.length > 0 && passkeys.map((passkey) => (
          <div key={passkey.id}>
            {passkey.username}
          </div>
        ))}
      </div> */}
    </Fragment>
  );
}


export default withZkLoginSessionRequired(Create);
