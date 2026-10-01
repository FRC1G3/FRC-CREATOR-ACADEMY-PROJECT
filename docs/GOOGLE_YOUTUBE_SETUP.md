# Google sign-in and optional YouTube connection

The implementation uses the installed Better Auth 1.7.6 APIs. It is code-complete, but real interactive Google authorization must be verified after configuration. No credentials, Google Cloud settings or deployment were changed by this task.

## Manual Google Cloud configuration

1. Create/select your Google Cloud project. Configure Google Auth Platform / OAuth consent: app name, support email, developer contact, audience and authorized domains as appropriate for your app.
2. Enable **YouTube Data API v3** in that same project. No separate YouTube API key is required.
3. Create an OAuth client of type **Web application**. Use your exact app origin for authorized JavaScript origins, for example `http://localhost:3000` locally. Use a separate production origin when available.
4. Add authorized redirect URIs exactly:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://YOUR_DOMAIN/api/auth/callback/google`
   The app's actual route is `src/app/api/auth/[...all]/route.ts`, Better Auth's default `/api/auth` base path. `/auth/complete` and `/profile/youtube/complete` are app return routes, **not** Google redirect URIs.
5. Configure identity scopes `openid`, `email`, `profile` and the optional `https://www.googleapis.com/auth/youtube.readonly` scope. For an external app in Testing, add your testing Google accounts to Test users. Meet Google's current consent/verification requirements before expanding access; this task does not claim public OAuth verification.
6. Copy the client ID and secret into your **private** local environment as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Never commit these values or prefix the secret with `NEXT_PUBLIC_`. Keep the existing `BETTER_AUTH_SECRET`, `DATABASE_URL` and `BETTER_AUTH_URL`; the latter must match the actual app origin. Restart the app after changing environment values. Configure a production environment separately when you intentionally deploy.

The Google controls are hidden when either Google variable is absent. Password login/registration still works. Builds and ordinary tests do not require Google credentials or a live Google API. Apply committed migrations with `npx prisma migrate deploy`, including `20261001000100_youtube_channel_metadata`, without reset.

## What each flow requests

| Flow | Permissions and behavior |
| --- | --- |
| Continue with Google | Identity only: openid, email, profile; online access; no forced consent or YouTube request |
| Profile -> Connect YouTube | Identity plus youtube.readonly, explicit consent/account selection, offline access for refresh tokens |

YouTube upload/edit/delete, Analytics, Gmail, Drive and Calendar permissions are not requested. Incremental authorization may show permissions previously granted to this app; it does not request new write permissions.

Existing password users should sign in with their password first and use **Connect YouTube** in Profile. This explicitly links Google to the current academy user, including accounts with different emails. Automatic email-based account merging is disabled. If a Google identity already belongs to another academy user, linking fails safely; the app does not merge those users. Google-created users are always STUDENT. Linking preserves existing ADMIN/STUDENT roles and intentionally edited local profile fields.

## Connection behavior

Profile linking -> Better Auth Google callback/state handling -> session-protected completion -> exact owned local Account record -> Better Auth server getAccessToken/refresh -> authenticated YouTube `channels.list(part=snippet,statistics, mine=true)` -> unique user-owned metadata upsert -> Profile.

If YouTube returns multiple channels, choose from the actual authenticated results. Selection is revalidated on the server. Empty results create no fake channel. The response is bounded to 50; an unexpected further page fails closed rather than silently selecting an arbitrary channel. Use an account/channel-specific authorization if that occurs.

Normal Profile loads read PostgreSQL only. **Refresh Channel** is manual, with pending feedback and a guard against duplicate clicks; there is no background polling. Hidden subscriber counts say Hidden; missing statistics say Unavailable. Counts are validated decimal strings persisted as BigInt, with safe compact presentation. YouTube itself can round subscriber statistics.

**View on YouTube** opens a fixed `https://www.youtube.com/channel/<channelId>` URL. A custom handle is display text, never a trusted arbitrary destination. **Remove Connection** requires confirmation and deletes only this user's local YouTubeConnection. It does not revoke permissions at Google, unlink the Google login account or delete a password account, user or learning history. Reconnect through Profile; revoke grants separately in Google Account permissions if desired.

OAuth tokens remain encrypted by Better Auth in Account. Profile/Client/Admin projections contain no token fields; browser access-token/refresh-token endpoints are disabled while internal server methods remain available. Legacy token columns in YouTubeConnection are preserved for migration compatibility and are never populated by this integration.

## Common problems

- `redirect_uri_mismatch`: scheme, hostname, port and complete callback path must match the Web application's authorized redirect URI exactly, including `localhost` versus `127.0.0.1`. Check `BETTER_AUTH_URL` and restart after configuration changes.
- Cancel/deny authorization: the app returns to Login or Profile with a generic explanation; password login remains available.
- No channel: use a Google account that owns a YouTube channel, then retry. No dummy data is created.
- Unauthorized/expired/revoked permission: reconnect from Profile. Better Auth refreshes expired access tokens using its stored refresh token when possible. Revoked/missing grants require consent again.
- API disabled/quota exhausted: enable the API in the OAuth client's project or wait/check project quotas. This is not fixed by repeatedly clicking Refresh.
- External OAuth app in Testing: Google normally expires refresh tokens after seven days when scopes extend beyond basic identity. This optional YouTube flow does extend beyond identity. Reconnect as needed while testing; production publishing/verification is a separate human task.

References: [Better Auth accounts/linking](https://better-auth.com/docs/concepts/users-accounts), [YouTube channels.list](https://developers.google.com/youtube/v3/docs/channels/list), [channel statistics](https://developers.google.com/youtube/v3/docs/channels), [Google web-server OAuth/offline access](https://developers.google.com/identity/protocols/oauth2/web-server).

Use [the final manual checklist](MANUAL_GOOGLE_YOUTUBE_SMOKE_TEST.md) after adding credentials. Automated mocked tests cannot establish real Google consent, offline renewal, channel ownership or browser layout.
