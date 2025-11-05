import { SidebarSection } from '@/components/sidebar/sidebar-section';
import { auth } from '@/lib/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';

export const Route = createFileRoute('/_dashboard/chat')({
  component: RouteComponent,
  beforeLoad: async () => {
    // const request = getRequestHeaders();
    // const session = await auth.api.getSession({ headers: request });
    // console.log('Loader session:', session);
  },
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
