import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/chat')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-96 shrink-0 h-full">
      <SidebarSection
        title="Recent Chats"
        description="View and manage your recent conversations."
      >
        Recent chats will appear here.
      </SidebarSection>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
