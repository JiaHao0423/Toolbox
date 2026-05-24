import { Link } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils'

type AppShellProps = {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-medium tracking-tight">我的工具箱</span>
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">持續更新中</p>
        </div>
      </footer>
    </div>
  )
}

type ToolPageShellProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function ToolPageShell({ title, description, children }: ToolPageShellProps) {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          返回工具列表
        </Link>

        <section className="mb-10">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="max-w-2xl text-muted-foreground leading-relaxed">{description}</p>
        </section>

        {children}
      </main>
    </AppShell>
  )
}
