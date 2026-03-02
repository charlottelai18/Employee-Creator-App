import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import EmployeeFormPage from './pages/EmployeeFormPage'
import EmployeeListPage from './pages/EmployeeListPage'
import './App.css'

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path='/' element={<EmployeeListPage />}/>
        <Route path='/employees/new' element={<EmployeeFormPage />}/>
        <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
      </Routes>
    </>
  )
}

export default App