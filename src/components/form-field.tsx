import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  field: any;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  currentImage?: string;
  labelFont?: string;
  renderLabel?: boolean;
}

export function FormField({
  field,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  currentImage,
  labelFont = 'font-bold',
  renderLabel = true,
}: FormFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'file' && field.state.value instanceof File) {
      const url = URL.createObjectURL(field.state.value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [field.state.value, type]);

  return (
    <div className="space-y-1">
      {renderLabel && (
        <Label htmlFor={field.name} className={cn(labelFont, 'text-md')}>
          {label}
        </Label>
      )}

      {type === 'file' ? (
        <div className="flex items-center gap-4">
          <Input
            id={field.name}
            name={field.name}
            type="file"
            accept="image/*"
            onBlur={field.handleBlur}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              field.handleChange(file);
            }}
            className="cursor-pointer"
          />
          <Avatar className="w-10 h-10">
            <AvatarImage src={previewUrl ?? currentImage} />
          </Avatar>
        </div>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}

      <div className="text-destructive text-sm min-h-5">
        {field.state.meta.errors.map(
          (err: string | { message?: string }, i: number) => (
            <div key={i}>{typeof err === 'string' ? err : err?.message}</div>
          ),
        )}
      </div>
    </div>
  );
}
