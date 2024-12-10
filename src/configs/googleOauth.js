import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
];

export const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope,
    include_granted_scopes: true,
});

export { google };