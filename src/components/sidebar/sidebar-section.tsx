import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

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
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
