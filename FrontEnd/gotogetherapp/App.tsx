import "react-native-reanimated";
import "react-native-get-random-values";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector } from "react-redux";
import store, { RootState } from "./src/reducers/store";
import { PaperProvider } from "react-native-paper";
import Layout from "./src/components/Layout/Layout";
import ApplicationNavigator from "./src/routers";
import NotificationToast from "./src/components/NotificationToast";
import { SocketProvider } from "./src/services/useSocket";

const queryClient = new QueryClient();

const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.login.accessToken);
  return <SocketProvider token={token}>{children}</SocketProvider>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SocketWrapper>
          <PaperProvider>
            <Layout>
              <NotificationToast />
              <ApplicationNavigator />
            </Layout>
          </PaperProvider>
        </SocketWrapper>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;

