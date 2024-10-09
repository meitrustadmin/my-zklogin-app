import { FormEvent, Fragment, useEffect, useState } from "react";
import { supported, create } from "@github/webauthn-json";
import { withIronSessionSsr } from "iron-session/next";
import { generateChallenge, isLoggedIn } from "lib/auth";
import { sessionOptions } from "lib/session";
import { useRouter } from "next/router";
import { API_HOST } from "lib/api/move";
import { withZkLoginSessionRequired } from "lib/zklogin/client";
import { GetServerSideProps } from "next";

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

function Create() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayname, setDisplayname] = useState("");
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
    };
    const createChallenge = () => {
      const challenge = generateChallenge();
      sessionStorage.setItem("challenge", challenge);
      setChallenge(challenge);
    }
    createChallenge();
    checkAvailability();
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
    console.log('usernameCheckResponse', usernameCheckResponse);
    
    const user = await usernameCheckResponse.json();
    if (!usernameCheckResponse.ok) {
      setError(user.message);
      return;
    }
    if (user) {
      setError("Username already in use");
      return;
    }

    const credential = await create({
      publicKey: {
        challenge: challenge as string,
        rp: {
          name: "next-webauthn",
          // TODO: Change
          id: 'localhost',
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
      body: JSON.stringify({ displayname, username, credential, challenge }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log('result', result);
    if (result.ok) {
      setFinished(true);
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

  return (
    <Fragment>
      <h1>Create Passkey</h1>
      {isAvailable ? (
        <form method="POST" onSubmit={onSubmit}>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            id="displayName"
            name="displayName"
            placeholder="Display Name"
            value={displayname}
            onChange={(event) => setDisplayname(event.target.value)}
          />
          <input type="submit" value="Register" />
          {error != null ? <pre>{error}</pre> : null}
        </form>
      ) : (
        <p>Sorry, webauthn is not available.</p>
      )}
      {finished ? <p>Registration successful!</p> : null}
    </Fragment>
  );
}


export default withZkLoginSessionRequired(Create);
