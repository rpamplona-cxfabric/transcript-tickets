const SESSION_EXPIRED_EVENT = "ianswer_session_expired";

let isRedirecting = false;

const currentReturnTo = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

export const redirectToSignIn = () => {
  if (typeof window === "undefined" || isRedirecting) {
    return;
  }

  isRedirecting = true;
  window.localStorage.setItem(SESSION_EXPIRED_EVENT, String(Date.now()));

  const signInUrl = `/signin?returnTo=${encodeURIComponent(currentReturnTo())}`;
  window.location.assign(
    `/auth/logout?returnTo=${encodeURIComponent(signInUrl)}`,
  );
};

export const sessionExpiredStorageKey = SESSION_EXPIRED_EVENT;
