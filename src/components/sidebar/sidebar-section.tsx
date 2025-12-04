import { useLocation } from '@tanstack/react-router';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SearchUserDialog } from './search-user-dialog';

type SidebarSectionProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function SidebarSection({ title, description, children }: SidebarSectionProps) {
  const location = useLocation();
  const isChat = location.pathname.includes('chat');
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
        {isChat && (
          <CardAction>
            <SearchUserDialog />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden">{children}</CardContent>
    </Card>
  );
}
