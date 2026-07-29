interface TypingIndicatorProps {
  displayName?: string;
}

export function TypingIndicator({ displayName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      {displayName && (
        <span className="text-xs text-slate-500 italic">{displayName} is typing...</span>
      )}
    </div>
  );
}
