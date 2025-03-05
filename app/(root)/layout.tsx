import Link from "next/link";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <Link href="/">AI-Powered Candidate Evaluation</Link>
        </h1>
        {children}
      </div>
    </main>
  );
}
