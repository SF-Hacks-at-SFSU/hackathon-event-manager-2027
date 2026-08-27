import {
  AuthOnlyProvider,
  BaseProtectedProvider,
  TeamManagementProtectedProvider
} from '@/providers/ProtectedProvider';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthOnlyProvider>
      <BaseProtectedProvider>
        <TeamManagementProtectedProvider>
          <main className="portal-page">{children}</main>
        </TeamManagementProtectedProvider>
      </BaseProtectedProvider>
    </AuthOnlyProvider>
  );
}
