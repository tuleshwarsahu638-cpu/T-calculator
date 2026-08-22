// Re-export from shared context so all components share the same settings state
export type {
  AppSettings,
  ButtonSize,
  DisplayTheme,
} from "../context/SettingsContext";
export { useSettings } from "../context/SettingsContext";
