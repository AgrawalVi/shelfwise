import Footer from "@/components/footer"
import Header from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-dvh">
      <Header />
      <div className="flex w-full flex-col p-4">{children}</div>
      <Footer />
    </div>
  )
}
