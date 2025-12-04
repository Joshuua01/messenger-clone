export function TypingIndicator() {
  return (
    <div className="px-3 py-4 rounded-lg bg-muted justify-self-start flex gap-2 items-center w-fit ml-12">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
    </div>
  );
}
