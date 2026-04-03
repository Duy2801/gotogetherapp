import { View, StyleSheet } from "react-native";
import { useSocketNotifications } from "../../services/useSocketNotifications";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  // Initialize socket notification listeners
  useSocketNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
export default Layout;
