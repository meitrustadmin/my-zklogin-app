import { FormEvent, Fragment, useEffect, useState } from "react";
import { supported, create, get } from "@github/webauthn-json";
import { withIronSessionSsr } from "iron-session/next";
import { generateChallenge, isLoggedIn } from "lib/auth";
import { sessionOptions } from "lib/session";
import { useRouter } from "next/router";
import { RPID } from "lib/api/move";
import { useAtom } from "jotai";
import { multiSigAtom } from "atoms";
import { withZkLoginSessionRequired } from "lib/zklogin/client";
import { useAddMutation } from "lib/hooks/api";
import { getSuiVisionTransactionUrl } from "lib/hooks/sui";
import Link from "next/link";

// export const getServerSideProps = withIronSessionSsr(async function ({
//     req,
//     res,
//   }) {
//     if (isLoggedIn(req)) {
//       return {
//         redirect: {
//           destination: "/admin",
//           permanent: false,
//         },
//       };
//     }
  
//     const challenge = generateChallenge();
//     req.session.challenge = challenge;
//     await req.session.save();
  
//     return { props: { challenge } };
//   },
//   sessionOptions);


export default withZkLoginSessionRequired(({ session }) => {
  const { isLoading, user, localSession } = session;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [challenge, setChallenge] = useState("");
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [multisigAddress] = useAtom(multiSigAtom)
  const { mutateAsync: add, isPending: isAdding } = useAddMutation();
  const [result, setResult] = useState<string>();

  // useEffect(() => {
  //   const createChallenge = () => {
  //     const challenge = generateChallenge();
  //     sessionStorage.setItem("challenge", challenge);
  //     setChallenge(challenge);
  //   }
  //   createChallenge();
  // }, [])

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
    };

    checkAvailability();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const credential = await get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: RPID,
      },
    });

    const result = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, credential }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.ok) {
      const result = await add({
        x: 5,
        y: 8,
        multisigAddress: multisigAddress as string,
        keyPair: localSession.ephemeralKeyPair,
      });
      setResult(result.txDigest);
    } else {
      const { message } = await result.json();
      setError(message);
    }
  };

  useEffect(() => {
    const fetchPasskeys = async () => {
      console.log('fetchPasskeys', multisigAddress);
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
  }, [multisigAddress]);

  return (
    <Fragment>
      <h1>Verify</h1>
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
        // <form method="POST" onSubmit={onSubmit}>
        //   <input
        //     type="email"
        //     id="email"
        //     name="email"
        //     placeholder="Email"
        //     value={email}
        //     onChange={(event) => setEmail(event.target.value)}
        //   />
        //   <input type="submit" value="Login" />
        //   {error != null ? <pre>{error}</pre> : null}
        // </form>
        <button onClick={onSubmit}>Submit Transaction</button>
      ) : (
        <p>Sorry, webauthn is not available.</p>
      )}
      {error != null ? <pre>{error}</pre> : null}
      {result != null ? <pre><Link
                href={getSuiVisionTransactionUrl(result)}
                target="_blank"
              >
                {result}
              </Link></pre> : null}
    </Fragment>
  );
})


