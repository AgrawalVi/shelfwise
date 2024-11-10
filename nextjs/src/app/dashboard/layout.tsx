export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full">
      <div className="flex w-full flex-col p-4">{children}</div>
    </div>
  )
}
