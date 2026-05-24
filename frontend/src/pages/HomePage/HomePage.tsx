import { Link } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { tools } from '../../data/tools'
import './HomePage.scss'

export default function HomePage() {
  return (
    <AppShell>
      <main className="home-page">
        <section className="home-page__hero">
          <h1 className="home-page__title">個人小工具集合</h1>
          <p className="home-page__subtitle">
            這裡存放我自己製作的各種實用小工具，旨在簡化日常工作流程、提升效率。
          </p>
        </section>

        <section>
          <div className="home-page__section-header">
            <span className="home-page__section-label">工具列表</span>
            <div className="home-page__section-line" />
          </div>

          <div className="home-page__tools">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.href} className="home-page__tool-link">
                <div className="home-page__tool-content">
                  <div className="home-page__tool-icon">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="home-page__tool-name">{tool.name}</h3>
                    <p className="home-page__tool-desc">{tool.description}</p>
                  </div>
                </div>
                <ArrowRight className="home-page__tool-arrow" />
              </Link>
            ))}

            <div className="home-page__placeholder">
              <div className="home-page__tool-content">
                <div className="home-page__placeholder-icon">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="home-page__placeholder-title">更多工具</h3>
                  <p className="home-page__placeholder-desc">敬請期待...</p>
                </div>
              </div>
              <span className="home-page__badge">即將推出</span>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
