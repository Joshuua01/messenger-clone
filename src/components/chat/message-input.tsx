import { useForm } from '@tanstack/react-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping: () => void;
}

export function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const form = useForm({
    defaultValues: {
      message: '',
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.message.trim();
      if (!trimmed) return;
      await onSend(trimmed);
      form.reset();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex gap-4 items-center p-6"
    >
      <form.Field name="message">
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
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
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
      </form.Subscribe>
    </form>
  );
}
