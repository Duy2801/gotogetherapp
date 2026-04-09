import 'react-native-reanimated';
import 'react-native-get-random-values';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import store, { RootState } from './src/reducers/store';
import { PaperProvider } from 'react-native-paper';
import Layout from './src/components/Layout/Layout';
import ApplicationNavigator from './src/routers';
import NotificationToast from './src/components/NotificationToast';
import { SocketProvider } from './src/services/useSocket';
import { useDispatch } from 'react-redux';
import { getItem } from './src/utils/storage';
import { KEY_STORAGE } from './src/constants/KeyStorage';
import { setLocale } from './src/reducers/localeReducer';
import { Locale } from './src/i18n';

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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <LocaleBootstrapper>
          <SocketWrapper>
            <PaperProvider>
              <Layout>
                <NotificationToast />
                <ApplicationNavigator />
              </Layout>
            </PaperProvider>
          </SocketWrapper>
        </LocaleBootstrapper>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
