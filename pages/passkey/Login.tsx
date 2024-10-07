import Link from "next/link";
import { db } from "pages/db";
import PasskeyRegisterButton from "./PasskeyRegisterButton";


export default function LoggedIn(props: { username: string }) {
	const { hasPasskeys } = db.users.find((u) => u.username === props.username) ?? {};

	return (
		<>
			<PasskeyRegisterButton username={props.username} />

			{hasPasskeys ? (
				<div>
					Now try to log in with your passkey!{" "}
					<Link className="text-center underline decoration-2 text-[#f23054]" href="/api/auth/signout">
						Log out
					</Link>
				</div>
			) : (
				<Link className="text-center underline decoration-2 opacity-75" href="/api/auth/signout">
					Log out
				</Link>
			)}
		</>
	);
}
