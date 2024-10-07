import {
    getAppleAuthUrl,
    getFacebookAuthUrl,
    getGoogleAuthUrl,
    getTwitchAuthUrl,
    relativeToCurrentEpoch,
    withNewZkLoginSession,
  } from "lib/zklogin/client";
import { sui } from "lib/hooks/sui";
import { useRouter } from "next/router";
import { first } from "lib/shared/utils";
import {
    APPLE_CLIENT_ID,
    FACEBOOK_CLIENT_ID,
    GOOGLE_CLIENT_ID,
    TWITCH_CLIENT_ID,
  } from "lib/shared/openid";

const Recover = withNewZkLoginSession (
    () => relativeToCurrentEpoch(sui),
    ({ session }) => {
      const router = useRouter();
      const redirectTo = first(router.query.redirectTo);
  
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