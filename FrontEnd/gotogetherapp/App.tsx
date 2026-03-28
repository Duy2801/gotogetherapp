import "react-native-reanimated";
import "react-native-get-random-values";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useSelector } from "react-redux";
import store, { RootState } from "./src/reducers/store";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import Layout from "./src/components/Layout/Layout";
import ApplicationNavigator from "./src/routers";
import NotificationToast from "./src/components/NotificationToast";
import { CustomToastComponent } from "./src/config/Toast";
import { socketService } from "./src/services/socket.service";

const queryClient = new QueryClient();

/**
 * Socket wrapper component
 * Handles Socket.IO connection and setup
 */
const SocketWrapper = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.login.accessToken);

  useEffect(() => {
    if (token) {
      // Connect to Socket.IO when auth token is available
      socketService.connect(token).catch(error => {
        console.error("Failed to connect to Socket.IO:", error);
      });
    } else {
      // Disconnect when token is cleared (logout)
      socketService.disconnect();
    }

    return () => {
      // Cleanup on unmount
      socketService.disconnect();
    };
  }, [token]);

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PaperProvider>
          <SocketWrapper>
            <Layout>
              <NotificationToast />
              <ApplicationNavigator />
              <Toast config={{ notification: CustomToastComponent as any }} />
            </Layout>
          </SocketWrapper>
        </PaperProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;

