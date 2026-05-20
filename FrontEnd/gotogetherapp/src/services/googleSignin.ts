type GoogleSigninLike = {
  configure?: (options?: any) => void;
  hasPlayServices?: (options?: any) => Promise<boolean>;
  signIn?: (options?: any) => Promise<any>;
  getTokens?: () => Promise<{ accessToken?: string; idToken?: string }>;
  signOut?: () => Promise<void>;
  statusCodes?: Record<string, string>;
};

let cachedModule: GoogleSigninLike | null | undefined;

export const getGoogleSignin = (): GoogleSigninLike | null => {
  if (cachedModule !== undefined) {
    return cachedModule ?? null;
  }

  try {
    // If TurboModule for RNGoogleSignin isn't registered yet, avoid requiring
    // the package which would call TurboModuleRegistry.getEnforcing(...) and crash.
    try {
      // Use require here to avoid top-level import changes during bundling
      const { TurboModuleRegistry } = require('react-native');
      if (TurboModuleRegistry && typeof TurboModuleRegistry.get === 'function') {
        const tm = TurboModuleRegistry.get && TurboModuleRegistry.get('RNGoogleSignin');
        if (!tm) {
          cachedModule = null;
          return null;
        }
      }
    } catch (e) {
      // ignore - if TurboModuleRegistry isn't available, fall back to trying require below
    }
    // Try to require the JS package; if native part is missing this may throw,
    // but we'll catch the error and return null instead of crashing the app.
    let moduleRef: any = null;
    try {
      moduleRef = require('@react-native-google-signin/google-signin');
    } catch (requireErr) {
      console.warn('Could not require @react-native-google-signin/google-signin:', requireErr);
      cachedModule = null;
      return null;
    }
    cachedModule =
      moduleRef?.GoogleSignin ||
      moduleRef?.default ||
      moduleRef?.GoogleOneTapSignIn ||
      moduleRef ||
      null;
  } catch (error) {
    console.warn('Google Sign-In module is not available:', error);
    cachedModule = null;
  }

  return cachedModule ?? null;
};

export const isGoogleSigninAvailable = () => {
  try {
    const m = require('@react-native-google-signin/google-signin');
    return Boolean(m);
  } catch {
    return false;
  }
};

export const getGoogleSignInStatusCodes = () => {
  try {
    const googleSignin = getGoogleSignin();
    if (!googleSignin) {
      return {};
    }

    const moduleRef = require('@react-native-google-signin/google-signin');
    return moduleRef?.statusCodes || moduleRef?.GoogleSignin?.statusCodes || {};
  } catch {
    return {};
  }
};
