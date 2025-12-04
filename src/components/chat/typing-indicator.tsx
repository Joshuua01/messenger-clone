export function TypingIndicator() {
  return (
    <div className="bg-muted ml-12 flex w-fit items-center gap-2 justify-self-start rounded-lg px-3 py-4">
      <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
      <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
      <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
    </div>
  );
}
