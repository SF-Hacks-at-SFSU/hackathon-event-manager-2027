'use client';
import { NavigationTabOption } from '@/types/NavigationTab';
import { NavigationBar } from './components/NavigationBar';
import MobileNav from './components/NavigationMobile';

const components: NavigationTabOption[] = [
  {
    label: 'Dashboard',
    href: '/my-dashboard',
    description: ''
  },
  {
    label: 'Sign out',
    href: '/sign-out',
    description: ''
  }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-8">
      <div className="flex min-h-12 items-center justify-between border-b border-white/8 pb-4">
        <p className="text-sm font-medium text-muted-foreground">Participant dashboard</p>
        <div className="hidden md:flex">
          <NavigationBar navigationOptions={components} />
        </div>
        <div className="md:hidden">
          <MobileNav navigationOptions={components} />
        </div>
      </div>
      {children}
    </div>
  );
}
