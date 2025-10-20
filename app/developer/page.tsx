import Link from "next/link";

export default function DeveloperHub() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Developer Portal</h1>
      <p className="text-gray-600 text-sm">Register apps, manage API keys, see ingestion logs.</p>
      <div className="flex gap-3 text-sm">
        <Link href="/developer/apps" className="underline">My Apps</Link>
        <Link href="/developer/api-keys" className="underline">API Keys</Link>
      </div>
    </div>
  );
}
