import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import InventoryAutomationPage from './InventoryAutomation/InventoryAutomationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/inventory-automation" element={<InventoryAutomationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
