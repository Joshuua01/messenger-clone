import { cn } from '@/lib/utils';
import { ChatSelect } from '@/server/db/schema';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ChangeChatInfoForm } from './change-chat-info-form';
import { ChangeChatPictureForm } from './change-chat-picture-form';

interface ChatSettingsDialogProps {
  className?: string;
  chatInfo: ChatSelect;
}

export function ChatSettingsDialog({ className, chatInfo }: ChatSettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'icon-lg'}>
          <Settings className={cn(className, 'hover:text-primary cursor-pointer')} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>Manage your chat settings here.</DialogDescription>
        </DialogHeader>
        <ChangeChatPictureForm chatInfo={chatInfo} />
        <ChangeChatInfoForm chatInfo={chatInfo} />
      </DialogContent>
    </Dialog>
  );
}
