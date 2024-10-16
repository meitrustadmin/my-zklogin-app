import { sui } from "lib/hooks/sui";
import {
  APPLE_CLIENT_ID,
  FACEBOOK_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  TWITCH_CLIENT_ID,
} from "lib/shared/openid";
import { first } from "lib/shared/utils";
import {
  getAppleAuthUrl,
  getFacebookAuthUrl,
  getGoogleAuthUrl,
  getTwitchAuthUrl,
  relativeToCurrentEpoch,
  withNewZkLoginSession,
} from "lib/zklogin/client";
import { useRouter } from "next/router";

// This page should be installed at path "/auth/login".
// If you move it to a different path, remember to update env NEXT_PUBLIC_LOGIN_PAGE_PATH.
export default withNewZkLoginSession(
  () => relativeToCurrentEpoch(sui),
  ({ session }) => {
    const router = useRouter();
    //const redirectTo = first(router.query.redirectTo);
    const redirectTo = window.location.origin +'/recover'

    // TODO useEffect to check if identifier facebook and twitch are already in the session storage

    // Render sign-in options based on what's configured.
    return (
      <>
        {GOOGLE_CLIENT_ID && (
            <div>
                <button
                onClick={() => {
                    void router.replace(
                    getGoogleAuthUrl(
                        session,
                        GOOGLE_CLIENT_ID!,
                        "google", // Update if moved to another path
                        redirectTo,
                        ['email', 'profile'],
                        ['select_account']
                    ),
                    );
                }}
                >
                Sign in with Google
                </button>
            </div>
        )}
        {FACEBOOK_CLIENT_ID && (
            <div>
                <button
                onClick={() => {
                    void router.replace(
                    getFacebookAuthUrl(
                        session,
                        FACEBOOK_CLIENT_ID!,
                        "facebook", // Update if moved to another path
                        redirectTo,
                        ['email'],
                    ),
                    );
                }}
                >
                Sign in with Facebook
                </button>
            </div>
        )}
        {TWITCH_CLIENT_ID && (
            <div>
                <button
                onClick={() => {
                    void router.replace(
                    getTwitchAuthUrl(
                        session,
                        TWITCH_CLIENT_ID!,
                        "twitch", // Update if moved to another path
                        redirectTo,
                        ['user:read:email'],
                        ['email', 'name', 'picture', 'preferred_username'],
                        true
                    ),
                    );
                }}
                >
                Sign in with Twitch
                </button>
            </div>
        )}
        {APPLE_CLIENT_ID && (
            <div>
                <button
                onClick={() => {
                    void router.replace(
                    getAppleAuthUrl(
                        session,
                        APPLE_CLIENT_ID!,
                        "apple", // Update if moved to another path
                        redirectTo,
                        ['email', 'name'],
                    ),
                    );
                }}
                >
                Sign in with Apple
                </button>
            </div>
        )}
      </>
    );
  },
);
