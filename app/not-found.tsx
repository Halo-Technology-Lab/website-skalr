import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-4">That page does not exist or has moved.</p>
      <Link href="/" className="mt-8 inline-block underline">
        Back to home
      </Link>
    </div>
  );
}
