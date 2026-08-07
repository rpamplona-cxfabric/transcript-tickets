import { Auth0Client } from '@auth0/nextjs-auth0/server';

const audience = process.env.AUTH0_AUDIENCE || process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

export const auth0 = new Auth0Client({
  // The public variables are temporary migration fallbacks; use the server-only
  // AUTH0_* equivalents from .env.example for the deployed application.
  domain: process.env.AUTH0_DOMAIN || process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  appBaseUrl: process.env.APP_BASE_URL,
  // Keep OAuth access tokens on the server. Route handlers use auth0.getAccessToken().
  enableAccessTokenEndpoint: false,
});
