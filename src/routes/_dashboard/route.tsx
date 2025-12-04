import { AlertButton } from '@/components/alert-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from '@/lib/auth-client';
import { socket } from '@/lib/socket';
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { LayoutGrid, LogOut, MessageCircle, MessageCircleHeart, Settings } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const disconnectUserSocket = (userId?: string) => {
    if (!socket.connected) return;
    if (userId) socket.emit('leave_user_room', userId);
    socket.disconnect();
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error(`${result.error.message}`);
      return;
    }
    disconnectUserSocket(session.data?.user?.id);
    toast.success('Signed out successfully');
    navigate({
      to: '/login',
    });
  };

  const navItems = [
    { to: '/chat', icon: MessageCircle, label: 'Chats' },
    { to: '/notes', icon: LayoutGrid, label: 'Notes' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-accent flex max-h-screen min-h-screen p-4">
      <aside className="flex w-20 flex-col items-center justify-between px-2 py-6">
        <div className="flex flex-col items-center gap-12">
          <MessageCircleHeart size={48} />
          <nav className="flex flex-col items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-lg p-3 transition-colors ${
                    isActive
                      ? 'text-primary bg-muted-foreground/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted-foreground/20'
                  }`}
                >
                  <Icon strokeWidth={1.75} size={24} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-5">
          <Avatar>
            <AvatarImage src={session.data?.user?.image ?? undefined} />
            <AvatarFallback>{session.data?.user?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>

          <AlertButton
            onClick={handleSignOut}
            title="Ready to sign out?"
            description="You’ll be logged out of your account, but you can sign back in anytime."
          >
            <LogOut
              size={24}
              className="text-muted-foreground hover:text-destructive hover:bg-muted-foreground/20 box-content cursor-pointer rounded-lg p-3 transition-colors"
            />
          </AlertButton>
        </div>
      </aside>

      <main className="flex flex-1 gap-4 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
