import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormFieldProps = {
  field: any;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

export function FormField({
  field,
  label,
  type = 'text',
  placeholder,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={field.name} className="font-bold text-md">
        {label}
      </Label>
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
