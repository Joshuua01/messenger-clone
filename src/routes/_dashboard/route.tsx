import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from '@/lib/auth-client';
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from '@tanstack/react-router';
import {
  LayoutGrid,
  LogOut,
  MessageCircle,
  MessageCircleHeart,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error(`${result.error.message}`);
      return;
    }
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
    <div className="flex min-h-screen bg-accent p-4">
      <aside className="flex flex-col items-center justify-between py-6 px-2 w-20">
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
                  className={`transition-colors p-3 rounded-lg ${
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
            <AvatarFallback>
              {session.data?.user?.name?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>

          <LogOut
            className="text-muted-foreground hover:text-destructive transition-colors hover:bg-muted-foreground/20 p-3 cursor-pointer rounded-lg box-content"
            size={24}
            onClick={handleSignOut}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex gap-4">
        <Outlet />
      </main>
    </div>
  );
}
