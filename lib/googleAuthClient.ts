import GoogleProvider from 'next-auth/providers/google';
import env from '@/lib/env';

const provider =  GoogleProvider({
    clientId: env.google.clientId,
    clientSecret: env.google.clientSecret,
    allowDangerousEmailAccountLinking: true,
    authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/spreadsheets.readonly' 
        } 
    },
});

function getGoogleProvider () {
    return provider;
}

export { getGoogleProvider };