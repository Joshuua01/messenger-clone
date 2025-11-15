import { authClient, useSession } from '@/lib/auth-client';
import { uploadImageFn } from '@/lib/fn/upload-fn';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import z from 'zod';
import { FormField } from '../form-field';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function ChangeProfilePictureForm() {
  const session = useSession();

  const uploadImageForm = useForm({
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
        result = await uploadImageFn({ data: formData });
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
          uploadImageForm.handleSubmit();
        }}
        className="flex flex-col gap-1 mt-4"
      >
        <uploadImageForm.Field name="file">
          {(field) => (
            <FormField
              field={field}
              label="Upload profile picture"
              type="file"
              labelFont="font-semibold"
              currentImage={session.data?.user.image ?? undefined}
            />
          )}
        </uploadImageForm.Field>
        <uploadImageForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              size={'lg'}
              className="mt-2 font-bold self-end"
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
        </uploadImageForm.Subscribe>
      </form>
    </div>
  );
}
