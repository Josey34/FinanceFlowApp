import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import ThemedScreen from '@/components/ThemedScreen';
import { Link, router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { loginUser } from '@/services/auth';
import { showError } from '@/utils/toast';
import { signInWithGoogle, GOOGLE_CONFIG } from '@/services/googleAuth';
import { useAuthStore } from '@/store/authStore';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const theme = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CONFIG);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = (response.params as Record<string, string>)?.id_token ?? response.authentication?.idToken;
    if (!idToken) { showError('Google sign-in failed — no token received'); return; }
    setGoogleLoading(true);
    signInWithGoogle(idToken)
      .then((user) => {
        setUser({ uid: user.uid, email: user.email, displayName: user.displayName });
        router.replace('/(tabs)');
      })
      .catch((err: unknown) => showError(err instanceof Error ? err.message : 'Google sign-in failed'))
      .finally(() => setGoogleLoading(false));
  }, [response]);

  async function handleLogin() {
    if (!email || !password) { showError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      setUser({ uid: user.uid, email: user.email, displayName: user.displayName });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedScreen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="wallet" size={36} color={Colors.white} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>FinanceFlow</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Take control of your finances</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: theme.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, color: theme.text, borderColor: theme.border }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.googleBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}>
            {googleLoading
              ? <ActivityIndicator color={theme.text} />
              : <>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                  <Text style={[styles.googleBtnText, { color: theme.text }]}>Continue with Google</Text>
                </>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don&apos;t have an account? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four },
  hero: { alignItems: 'center', marginBottom: Spacing.six },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginTop: Spacing.two },
  subtitle: { fontSize: 15, marginTop: Spacing.one },
  form: { gap: Spacing.two },
  label: { fontSize: 13, fontWeight: '600', marginBottom: -Spacing.one },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 4,
    fontSize: 15, borderWidth: 1,
  },
  btn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.two, borderRadius: BorderRadius.md, paddingVertical: Spacing.two + 4,
    borderWidth: 1,
  },
  googleBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.two },
  footerText: { fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
