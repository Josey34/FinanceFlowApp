// String-host mock of react-native for vitest tests
// Each component is exported as a string so test-renderer treats it as a host component.
// This avoids the real react-native ESM/Flow parsing issue.

const createStyleSheet = (styles) => {
  const result = {};
  for (const key of Object.keys(styles)) {
    result[key] = styles[key];
  }
  return result;
};

const RN = {
  View: "View",
  Text: "Text",
  Image: "Image",
  ScrollView: "ScrollView",
  TextInput: "TextInput",
  TouchableOpacity: "TouchableOpacity",
  TouchableHighlight: "TouchableHighlight",
  TouchableWithoutFeedback: "TouchableWithoutFeedback",
  Pressable: "Pressable",
  Modal: "Modal",
  FlatList: "FlatList",
  SectionList: "SectionList",
  KeyboardAvoidingView: "KeyboardAvoidingView",
  SafeAreaView: "SafeAreaView",
  Switch: "Switch",
  ActivityIndicator: "ActivityIndicator",
  StatusBar: "StatusBar",
  RefreshControl: "RefreshControl",

  StyleSheet: {
    create: createStyleSheet,
    flatten: (style) => {
      if (style == null) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.map((s) => (s == null ? {} : s)));
      }
      return style;
    },
    absoluteFill: {},
    hairlineWidth: () => 1,
  },

  Platform: { OS: "web", select: (obj) => obj.web ?? obj.default },
  Dimensions: { get: () => ({ width: 375, height: 812 }) },

  Animated: {
    View: "View",
    Text: "Text",
    Image: "Image",
    ScrollView: "ScrollView",
    createAnimatedComponent: (C) => C,
    timing: () => ({ start: (cb) => cb?.({ finished: true }) }),
    spring: () => ({ start: (cb) => cb?.({ finished: true }) }),
    Value: class {
      constructor(v) {
        this._value = v;
      }
      setValue(v) {
        this._value = v;
      }
      interpolate() {
        return { __getValue: () => 0 };
      }
    },
  },

  processColor: (c) => c,
  PixelRatio: { get: () => 2, getFontScale: () => 1 },
};

module.exports = RN;
