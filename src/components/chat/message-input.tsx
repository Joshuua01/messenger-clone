import { ATTACHMENT_ALLOWED_TYPES, MAX_ATTACHMENT_SIZE } from '@/lib/fn/upload-fn';
import { useForm } from '@tanstack/react-form';
import { Paperclip } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  onSendAttachments: (files: File[]) => Promise<void>;
  onTyping: () => void;
}

export function MessageInput({ onSend, onSendAttachments, onTyping }: MessageInputProps) {
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const messageForm = useForm({
    defaultValues: {
      message: '',
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.message.trim();
      if (!trimmed) return;
      await onSend(trimmed);
      messageForm.reset();
    },
  });

  const attachmentForm = useForm({
    defaultValues: {
      files: [] as File[],
    },
    validators: {
      onSubmit: z.object({
        files: z
          .array(z.instanceof(File))
          .min(1, 'No files selected')
          .refine(
            (files) => files.every((f) => ATTACHMENT_ALLOWED_TYPES.includes(f.type)),
            'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF, TXT, ZIP, TAR, RAR',
          )
          .refine(
            (files) => files.every((f) => f.size <= MAX_ATTACHMENT_SIZE),
            'File too large (max 15MB)',
          ),
      }),
    },
    onSubmitInvalid: ({ formApi }) => {
      const errors = formApi.state.errors;
      errors.forEach((errorRecord) => {
        if (!errorRecord) return;
        Object.values(errorRecord).forEach((issues) => {
          issues.forEach((issue) => toast.error(issue.message));
        });
      });
    },
    onSubmit: async ({ value }) => {
      await onSendAttachments(value.files);
      attachmentForm.reset();
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    attachmentForm.setFieldValue('files', selectedFiles);
    attachmentForm.handleSubmit();
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-5 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          attachmentForm.handleSubmit();
        }}
        className="flex"
      >
        <attachmentForm.Field name="files">
          {() => (
            <Input
              type="file"
              ref={fileUploadRef}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          )}
        </attachmentForm.Field>
        <attachmentForm.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="button" onClick={() => fileUploadRef.current?.click()}>
              {isSubmitting ? (
                <>
                  <Spinner />
                </>
              ) : (
                <Paperclip />
              )}
            </Button>
          )}
        </attachmentForm.Subscribe>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          messageForm.handleSubmit();
        }}
        className="flex flex-1 items-center gap-4"
      >
        <messageForm.Field name="message">
          {(field) => (
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
                onTyping();
              }}
              placeholder="Type your message..."
              autoComplete="off"
            />
          )}
        </messageForm.Field>

        <messageForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          )}
        </messageForm.Subscribe>
      </form>
    </div>
  );
}
