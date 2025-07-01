import './App.css'
import FinancingForm from './component/Form'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Financing Request Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Submit your financing request with a validity period between 1-3
            years. Start date must be at least 15 days from Tuesday 1st July 2025.
          </p>
        </div>
        <FinancingForm />
      </div>
    </div>
  )
}

export default App
