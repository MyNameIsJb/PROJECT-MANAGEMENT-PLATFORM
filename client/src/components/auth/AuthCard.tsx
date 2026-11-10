interface AuthCardProps {
  title: string;
  subtitle: string;
  error?: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  error,
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-700 bg-red-900/50 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
