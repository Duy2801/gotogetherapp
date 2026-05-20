import 'react-native-reanimated';
import 'react-native-get-random-values';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import store, { RootState } from './src/reducers/store';
import { PaperProvider } from 'react-native-paper';
import Layout from './src/components/Layout/Layout';
import ApplicationNavigator from './src/routers';
import { SocketProvider } from './src/services/useSocket';
import { useDispatch } from 'react-redux';
import { getItem } from './src/utils/storage';
import { KEY_STORAGE } from './src/constants/KeyStorage';
import { setLocale } from './src/reducers/localeReducer';
import { Locale } from './src/i18n';
import { GOOGLE_WEB_CLIENT_ID } from './src/config/google';
import { api } from './src/api';
import { login, logout } from './src/reducers/loginReducer';
import { getGoogleSignin, isGoogleSigninAvailable } from './src/services/googleSignin';
import NotificationToast from './src/components/NotificationToastView';

const queryClient = new QueryClient();

const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.login.accessToken);
  return <SocketProvider token={token}>{children}</SocketProvider>;
};

const LocaleBootstrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = (await getItem(KEY_STORAGE.locale)) as
        | Locale
        | undefined;
      dispatch(setLocale(savedLocale === 'en' ? 'en' : 'vi'));
    };

    loadLocale();
  }, [dispatch]);

  return <>{children}</>;
};

const AuthBootstrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const googleSignin = getGoogleSignin();
    if (googleSignin?.configure) {
      googleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    } else {
      console.warn('Google Sign-In module could not be loaded');
    }
  }, []);

  React.useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const [token, refreshToken, user, startDate] = await Promise.all([
          getItem(KEY_STORAGE.token),
          getItem(KEY_STORAGE.refreshToken),
          getItem(KEY_STORAGE.user),
          getItem(KEY_STORAGE.startDate),
        ]);

        if (token) {
          const me = await api.get('/user/me');
          dispatch(
            login({
              user: me,
              accessToken: token,
              refreshToken: refreshToken || '',
              startDate: startDate || null,
            }),
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      } finally {
        setReady(true);
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  if (!ready) {
    return (
      <View style={styles.bootstrapContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <LocaleBootstrapper>
          <AuthBootstrapper>
            <SocketWrapper>
              <PaperProvider>
                <Layout>
                  <NotificationToast />
                  <ApplicationNavigator />
                </Layout>
              </PaperProvider>
            </SocketWrapper>
          </AuthBootstrapper>
        </LocaleBootstrapper>
      </Provider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  bootstrapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
