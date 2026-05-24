import { ClipboardList, type LucideIcon } from 'lucide-react'

export type Tool = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  href: string
  status: 'available' | 'coming-soon'
}

export const tools: Tool[] = [
  {
    id: 'inventory-automation',
    name: '盤點表自動化工具',
    description: '自動化處理庫存盤點流程，提升工作效率',
    icon: ClipboardList,
    href: '/tools/inventory-automation',
    status: 'available',
  },
]
