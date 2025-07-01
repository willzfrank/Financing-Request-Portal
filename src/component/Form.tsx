import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { AppContext } from '../store/context'
import { financingSchema, OPEC_COUNTRIES } from '../utils/Contants'

export type FinancingFormValues = {
  name: string
  country: string
  projectCode: string
  description: string
  amount: number
  currency: string
  startDate: string
  endDate: string
}

const FinancingForm = () => {
  const context = useContext(AppContext)
  const countries = context?.countries || []
  const currencies = context?.currencies || {}

  // Calculate minimum start date (15 days from today)
  const minStartDate = new Date(Date.now() + 1296000000)
    .toISOString()
    .split('T')[0]

  const [isOpec, setIsOpec] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState } =
    useForm<FinancingFormValues>({
      resolver: yupResolver(financingSchema),
      mode: 'onChange',
    })

  const { errors, isValid } = formState

  const selectedCountry = watch('country')

  useEffect(() => {
    const isOpecCountry = OPEC_COUNTRIES.includes(selectedCountry)
    setIsOpec(isOpecCountry)

    if (isOpecCountry) {
      setValue('currency', 'USD')
    }
  }, [selectedCountry, setValue])

  const onSubmit = async (data: FinancingFormValues) => {
    setIsSubmitting(true)

    try {
      // Calculate validity period in years
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const validityPeriod = endDate.getFullYear() - startDate.getFullYear()

      // Transform data for API
      const apiData = {
        fullName: data.name,
        countryCode: data.country,
        projectCode: data.projectCode,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: data.startDate,
        validityPeriod: validityPeriod,
      }

      await axios.post(
        'http://test-noema-api.azurewebsites.net/api/requests',
        apiData
      )

      toast.success('Financing request submitted successfully!')
      reset()
    } catch (error: unknown) {
      console.error('Submission error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit request. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Toaster for notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Name/Surname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name/Surname *
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Origin Country *
          </label>
          <select
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('country')}
          >
            <option value="">Select Country</option>
            {countries.map((c: { label: string; value: string }) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">
              {errors.country.message}
            </p>
          )}
        </div>

        {/* Project Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Code *
          </label>
          <input
            type="text"
            placeholder="e.g., ABCD-1234"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.projectCode ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('projectCode')}
          />
          {errors.projectCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.projectCode.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format: XXXX-XXXX (4 capital letters, hyphen, 4 digits 1-9)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            placeholder="Describe your financing request"
            rows={3}
            maxLength={150}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {watch('description')?.length || 0}/150 characters
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency *
          </label>
          {isOpec ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value="USD"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          ) : (
            <select
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currency ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('currency')}
            >
              <option value="">Select Currency</option>
              {Object.entries(currencies).map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {String(name)}
                </option>
              ))}
            </select>
          )}
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currency.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            min={minStartDate}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            You can only select a start date at least 15 days from today.
          </p>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date *
          </label>
          <input
            type="date"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Validity period must be between 1-3 years
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isSubmitting || !isValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Financing Request'}
        </button>
      </form>
    </div>
  )
}

export default FinancingForm
