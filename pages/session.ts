import { getServerSession as gss } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export function getServerSession() {
	return gss(authOptions);
}
