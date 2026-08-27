import {
  AuthOnlyProvider,
  BaseProtectedProvider,
  FullyProtectedProvider
} from '@/providers/ProtectedProvider';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthOnlyProvider>
      <BaseProtectedProvider>
        <FullyProtectedProvider>
          <main className="portal-page">{children}</main>
        </FullyProtectedProvider>
      </BaseProtectedProvider>
    </AuthOnlyProvider>
  );
}
