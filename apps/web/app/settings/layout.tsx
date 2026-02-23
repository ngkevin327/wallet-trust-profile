import { AppShell } from "../../components/layout/app-shell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Settings">{children}</AppShell>;
}
