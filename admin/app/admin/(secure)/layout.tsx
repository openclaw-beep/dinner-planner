import { AdminShell } from '@/components/AdminShell';

export default function SecureAdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}
