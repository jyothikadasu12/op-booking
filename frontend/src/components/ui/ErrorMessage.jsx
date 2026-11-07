const ErrorMessage = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 font-medium text-red-700 underline">
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;
