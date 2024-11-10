import Footer from "@/components/footer"
import Header from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="flex flex-col justify-center items-center min-h-dvh">{children}</div>
  )
}
