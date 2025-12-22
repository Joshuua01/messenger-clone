import { MessageAttachment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { File, FileArchive, FileText } from 'lucide-react';

interface FileAttachmentsProps {
  attachments: MessageAttachment[];
  isOwn: boolean;
}

function getFileIcon(type: string) {
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  if (
    type.includes('zip') ||
    type.includes('rar') ||
    type.includes('tar') ||
    type.includes('compressed')
  )
    return FileArchive;
  return File;
}

async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}

export function FileAttachments({ attachments, isOwn }: FileAttachmentsProps) {
  return (
    <div className="flex flex-col gap-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.type);

        return (
          <div
            key={attachment.id}
            onClick={() => downloadFile(attachment.url, attachment.name)}
            className={cn(
              'flex w-fit cursor-pointer items-center gap-2 rounded-xl px-3 py-2 hover:underline',
              isOwn
                ? 'bg-primary text-primary-foreground justify-self-end'
                : 'bg-muted text-foreground justify-self-start',
            )}
          >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg')}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="truncate text-sm font-medium">{attachment.name}</div>
          </div>
        );
      })}
    </div>
  );
}
