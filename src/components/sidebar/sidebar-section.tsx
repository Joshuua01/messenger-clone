import { useLocation } from '@tanstack/react-router';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { SearchUserDialog } from './search-user-dialog';

type SidebarSectionProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function SidebarSection({
  title,
  description,
  children,
}: SidebarSectionProps) {
  const location = useLocation();
  const isChat = location.pathname.includes('chat');
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
        {isChat && (
          <CardAction>
            <SearchUserDialog />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
