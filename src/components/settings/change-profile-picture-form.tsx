import { authClient, useSession } from '@/lib/auth-client';
import { uploadAvatarFn } from '@/lib/fn/upload-fn';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import z from 'zod';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function ChangeProfilePictureForm() {
  const session = useSession();

  const uploadAvatarForm = useForm({
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

      let result;
      try {
        result = await uploadAvatarFn({ data: formData });
      } catch (error: any) {
        toast.error(`Image upload failed: ${error.message}`);
        return;
      }

      await authClient.updateUser(
        {
          image: result.url,
        },
        {
          onSuccess: () => {
            toast.success('Profile picture updated successfully!');
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <div>
      <h1 className="text-lg font-bold">Profile Picture</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          uploadAvatarForm.handleSubmit();
        }}
        className="mt-4 flex flex-col gap-1"
      >
        <uploadAvatarForm.Field name="file">
          {(field) => (
            <FormField
              field={field}
              label="Upload profile picture"
              type="file"
              labelFont="font-semibold"
              currentImage={session.data?.user.image ?? undefined}
            />
          )}
        </uploadAvatarForm.Field>
        <uploadAvatarForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              size={'lg'}
              className="mt-2 self-end font-bold"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Uploading...
                </>
              ) : (
                'Upload Picture'
              )}
            </Button>
          )}
        </uploadAvatarForm.Subscribe>
      </form>
    </div>
  );
}
