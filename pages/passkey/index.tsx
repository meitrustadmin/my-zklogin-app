<<<<<<< HEAD
import Link from "next/link";
import { getServerSession } from "pages/session";
import { use, useCallback } from "react";
import LoggedIn from "./Login";
import { LoggedOut } from "./LoggedOut";

export default function PasskeyHome() {
    const session = use(getServerSession());

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
				<div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
					<Link
						className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
						href="https://hanko.io"
						target="_blank"
						rel="noopener noreferrer"
					>
						By <img src="/hanko.svg" alt="Hanko Logo" width={20} height={20} /> Hanko
					</Link>
				</div>
			</div>

			<div className="relative flex gap-32 items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
				<div className="flex flex-col gap-8 items-center">
					<img
						className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
						src="/next.svg"
						alt="Next.js Logo"
						width={180}
						height={37}
					/>
					<span className="text-4xl font-medium mt-1.5">+</span>
					<div className="text-4xl flex items-center gap-3 font-semibold ">
						<img
							className="dark:drop-shadow-[0_0_0.5rem_#f23054]"
							src="/hanko.svg"
							alt="Hanko Logo"
							width={40}
							height={40}
						/>
						<span className="dark:drop-shadow-[0_0_0.3rem_#ffffff70]">Hanko Passkey API</span>
					</div>
				</div>

				<div className="flex flex-col gap-8">
					{session?.user?.name ? <LoggedIn username={session.user.name} /> : <LoggedOut />}
				</div>
			</div>
        </main>
    )
}
=======
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
            <li>
                <Link href="/passkey/verify">Verify</Link>
            </li>
            </ul>
            <p>
            <a href="https://ianmitchell.dev/blog/nextjs-and-webauthn">
                Learn More
            </a>
            </p>
      </Fragment>
    )
})
>>>>>>> multi-sig
