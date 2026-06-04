import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// Configure these in your .env:
// EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxx.apps.googleusercontent.com
// EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxx.apps.googleusercontent.com
// EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxx.apps.googleusercontent.com

export const GOOGLE_CONFIG = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
};

export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

// Usage in component:
// const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CONFIG);
// useEffect(() => {
//   if (response?.type === 'success') {
//     const { id_token } = response.params;
//     signInWithGoogle(id_token).then(user => setUser({...}));
//   }
// }, [response]);
