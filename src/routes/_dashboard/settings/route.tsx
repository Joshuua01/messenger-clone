import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Paintbrush, User } from 'lucide-react';

export const Route = createFileRoute('/_dashboard/settings')({
  component: RouteComponent,
});

const settings = [
  { label: 'Profile', to: '/settings/profile', icon: User },
  {
    label: 'Appearance',
    to: '/settings/appearance',
    icon: Paintbrush,
  },
];

function RouteComponent() {
  const location = useLocation();

  return (
    <>
      <div className="h-full w-96 shrink-0">
        <SidebarSection
          title="Settings"
          description="Manage your account settings and preferences."
        >
          {settings.map((setting) => {
            const Icon = setting.icon;
            const isActive = location.pathname.startsWith(setting.to);
            return (
              <Link
                key={setting.to}
                to={setting.to}
                className={`text-muted-foreground hover:text-primary hover:bg-muted-foreground/20 mt-1 flex items-center gap-5 rounded-lg p-3 font-medium transition-colors ${
                  isActive ? 'bg-muted-foreground/20 text-primary' : ''
                }`}
              >
                <Icon strokeWidth={1.75} size={24} /> {setting.label}
              </Link>
            );
          })}
        </SidebarSection>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </>
  );
}
