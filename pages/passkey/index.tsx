import { withZkLoginSessionRequired } from "lib/zklogin/client/index";
import { Fragment } from "react";
import Link from "next/link";


export default withZkLoginSessionRequired(({ session } : {session: any}) => {
    const { isLoading, user, localSession } = session;
    if (isLoading) return <p>Loading zkLogin session...</p>;
    
    return (
        <Fragment>
            <h1>Next.js Webauthn Demo</h1>
            {JSON.stringify(user)}
            {/* {JSON.stringify(localSession)} */}
            <ul>
            <li>
                <Link href="/passkey/create">Create</Link>
            </li>
            {/* <li>
                <Link href="/passkey/verify">Verify</Link>
            </li> */}
            </ul>
            <p>
            <a href="https://ianmitchell.dev/blog/nextjs-and-webauthn">
                Learn More
            </a>
            </p>
      </Fragment>
    )
})
