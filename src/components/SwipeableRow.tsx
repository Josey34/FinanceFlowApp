import { BorderRadius, Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";

const SWIPE_THRESHOLD = 72;

interface SwipeableRowProps {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export default function SwipeableRow({
  onEdit,
  onDelete,
  children,
}: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
      onPanResponderMove: (_, { dx }) =>
        translateX.setValue(Math.max(-110, Math.min(110, dx))),
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onDelete();
          });
        } else if (dx > SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => onEdit());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.leftAction}>
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.label}>Edit</Text>
      </View>
      <View style={styles.rightAction}>
        <Ionicons name="trash" size={18} color="#fff" />
        <Text style={styles.label}>Delete</Text>
      </View>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...pan.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
  },
  leftAction: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  rightAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
