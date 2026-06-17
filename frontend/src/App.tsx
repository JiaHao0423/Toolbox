import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import InventoryAutomationPage from './InventoryAutomation/InventoryAutomationPage'
import ParkingFeePage from './ParkingFee/ParkingFeePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/inventory-automation" element={<InventoryAutomationPage />} />
        <Route path="/tools/parking-fee" element={<ParkingFeePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
