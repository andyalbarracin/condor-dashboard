import { FileUp } from "lucide-react"
import Link from "next/link"

export function BlankState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="p-4 bg-primary/5 rounded-full mb-6">
        <FileUp className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No data yet</h2>
      <p className="text-neutral-500 text-center mb-6 max-w-sm">
        Upload your first analytics export to get started with CONDOR Dashboard
      </p>
      <Link
        href="/upload"
        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
      >
        Upload Analytics
      </Link>
    </div>
  )
}
