import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    field.handleChange(file);
  };

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
              handleFileChange(file);
            }}
            className="cursor-pointer"
          />
          <Avatar className="h-10 w-10">
            <AvatarImage src={previewUrl ?? currentImage} />
            <AvatarFallback>{label[0]}</AvatarFallback>
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

      <div className="text-destructive min-h-5 text-sm">
        {field.state.meta.errors.map((err: string | { message?: string }, i: number) => (
          <div key={i}>{typeof err === 'string' ? err : err?.message}</div>
        ))}
      </div>
    </div>
  );
}
