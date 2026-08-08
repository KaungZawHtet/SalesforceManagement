import { AccountsView } from '@/components/accounts/accounts-view';
import { Toaster } from '@/components/ui/sonner';

export default function HomePage() {
  return (
    <>
      <AccountsView />
      <Toaster />
    </>
  );
}
