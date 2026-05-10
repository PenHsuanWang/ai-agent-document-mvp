/** Three animated dots indicating the agent is thinking. */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" role="status" aria-label="Agent is typing">
      {['-0.3s', '-0.15s', '0s'].map((delay) => (
        <span
          key={delay}
          className="block h-2 w-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  )
}
