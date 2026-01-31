import { editChatFn } from '@/lib/fn/chat-fn';
import { ChatSelect } from '@/server/db/schema';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

interface ChangeChatInfoFormProps {
  chatInfo: ChatSelect;
}

export function ChangeChatInfoForm({ chatInfo }: ChangeChatInfoFormProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: chatInfo.name || '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, 'Name is required'),
      }),
    },
    onSubmit: async (values) => {
      try {
        await editChatFn({
          data: {
            chatId: chatInfo.id,
            name: values.value.name,
          },
        });
        toast.success('Chat updated successfully');
        router.invalidate();
      } catch (error: any) {
        toast.error(`Chat update failed: ${error.message}`);
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
        <form.Field name="name">
          {(field) => (
            <FormField
              field={field}
              label="Chat name"
              type="text"
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
                'Update chat'
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
