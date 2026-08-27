export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center px-5 py-10 sm:px-8 sm:py-16">
      <div className="w-full max-w-4xl space-y-8">
        {/* TODO Still appears in loading for replacements on create-profile. Find a way to hide this on that load. */}
        {children}
      </div>
    </main>
  );
}
