import SignOutButton from "@/components/admin/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Asha Admin</h1>
        <SignOutButton />
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
