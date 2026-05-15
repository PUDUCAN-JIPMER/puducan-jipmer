// app/_offline/page.tsx
"use client";

export default function OfflinePage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold">You’re offline</h1>
        <p className="text-gray-600 mt-2">
          It looks like you lost your internet connection.
          Don’t worry, you can still browse pages you visited before.
        </p>
      </div>
    </div>
  );
}
