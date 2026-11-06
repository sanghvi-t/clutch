import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const"; import type { Express, Request, Response } from "express"; import * as db from "../db"; import { getSessionCookieOptions } from "./cookies"; import { sdk } from "./sdk"; import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined { const value = req.query[key]; return typeof value === "string" ? value : undefined; }

export function registerOAuthRoutes(app: Express) {

  // Mobile: Sign in with Google (ID token from Google Sign-In SDK)
  app.post("/api/auth/mobile/google", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken) { res.status(400).json({ error: "idToken required" }); return; }
      // Verify Google ID token
      const ticket = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      const payload = await ticket.json() as any;
      if (!payload.sub) { res.status(401).json({ error: "Invalid Google ID token" }); return; }
      const openId = `google:${payload.sub}`;
      await db.upsertUser({ openId, name: payload.name || null, email: payload.email ?? null, loginMethod: "google", lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(openId, { name: payload.name || "", expiresInMs: ONE_YEAR_MS });
      res.json({ sessionToken, user: { openId, name: payload.name, email: payload.email } });
    } catch (err) {
      console.error("[Mobile/Google] Auth failed", err);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  // Mobile: Sign in with Apple (identity token from expo-apple-authentication)
  app.post("/api/auth/mobile/apple", async (req: Request, res: Response) => {
    try {
      const { identityToken, fullName } = req.body;
      if (!identityToken) { res.status(400).json({ error: "identityToken required" }); return; }
      // Decode Apple JWT (header.payload.sig — no secret verification needed server-side for sub extraction)
      const parts = identityToken.split(".");
      if (parts.length !== 3) { res.status(401).json({ error: "Invalid Apple identity token" }); return; }
      const applePayload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as any;
      if (!applePayload.sub) { res.status(401).json({ error: "Invalid Apple token payload" }); return; }
      const openId = `apple:${applePayload.sub}`;
      const name = fullName || applePayload.email?.split("@")[0] || "Athlete";
      await db.upsertUser({ openId, name, email: applePayload.email ?? null, loginMethod: "apple", lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
      res.json({ sessionToken, user: { openId, name, email: applePayload.email } });
    } catch (err) {
      console.error("[Mobile/Apple] Auth failed", err);
      res.status(500).json({ error: "Apple authentication failed" });
    }
  });

  app.get("/api/oauth/google", (req: Request, res: Response) => { const redirectUri = `${ENV.appUrl}/api/oauth/callback`; console.log('[OAuth] Initiating login, redirectUri:', redirectUri); const params = new URLSearchParams({ client_id: ENV.googleClientId, redirect_uri: redirectUri, response_type: "code", scope: "openid email profile", access_type: "offline", }); const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`; console.log('[OAuth] Redirecting to Google:', googleUrl); res.redirect(googleUrl); });

app.get("/api/oauth/callback", async (req: Request, res: Response) => { const code = getQueryParam(req, "code"); if (!code) { res.status(400).json({ error: "Authorization code missing" }); return; } try { const redirectUri = `${ENV.appUrl}/api/oauth/callback`; const tokenRes = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: ENV.googleClientId, client_secret: ENV.googleClientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }), }); const tokens = await tokenRes.json() as any; if (!tokens.access_token) { res.status(500).json({ error: "Failed to exchange token" }); return; } const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` }, }); const userInfo = await userInfoRes.json() as any; if (!userInfo.id) { res.status(400).json({ error: "Failed to get user info from Google" }); return; } await db.upsertUser({ openId: `google:${userInfo.id}`, name: userInfo.name || null, email: userInfo.email ?? null, loginMethod: "google", lastSignedIn: new Date() }); const sessionToken = await sdk.createSessionToken(`google:${userInfo.id}`, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS }); const cookieOptions = getSessionCookieOptions(req); res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS }); res.redirect(302, "/dashboard"); } catch (error) { console.error("[OAuth] Callback failed", error); console.error('[OAuth] Full error:', JSON.stringify(error)); res.status(500).json({ error: "OAuth callback failed" }); } }); }
