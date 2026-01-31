import { editChatFn } from '@/lib/fn/chat-fn';
import { uploadImageFn } from '@/lib/fn/upload-fn';
import { ChatSelect } from '@/server/db/schema';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

interface ChangeChatPictureFormProps {
  chatInfo: ChatSelect;
}

export function ChangeChatPictureForm({ chatInfo }: ChangeChatPictureFormProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onSubmit: z.object({
        file: z
          .instanceof(File, { error: 'Please upload a valid file' })
          .refine((file) => file.size < 5 * 1024 * 1024, 'File size too large'),
      }),
    },
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('file', values.value.file!);
      formData.append('type', 'group');
      formData.append('currentImage', chatInfo.imageUrl ?? '');

      try {
        const result = await uploadImageFn({ data: formData });
        await editChatFn({
          data: {
            chatId: chatInfo.id,
            imageUrl: result.url,
          },
        });
        toast.success('Chat picture updated successfully');
        router.invalidate();
      } catch (error: any) {
        toast.error(`Chat image change failed: ${error.message}`);
        return;
      }
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-4 flex flex-col"
      >
        <form.Field name="file">
          {(field) => (
            <FormField
              field={field}
              label="Upload chat picture"
              type="file"
              labelFont="font-semibold"
              currentImage={chatInfo.imageUrl ?? undefined}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} className="self-end font-bold">
              {isSubmitting ? (
                <>
                  <Spinner /> Uploading...
                </>
              ) : (
                'Upload Picture'
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
