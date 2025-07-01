import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { AppContext } from '../store/context'
import {
  financingSchema,
  OPEC_COUNTRIES,
  VALIDITY_PERIOD,
  FORM_LIMITS,
  API_ENDPOINTS,
  getMinStartDate,
  calculateValidityPeriod,
} from '../utils/Constants'

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
  const isLoading = context?.isLoading || false

  // Use the constant-based minimum start date
  const minStartDate = getMinStartDate()

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

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading form data...
            </span>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: FinancingFormValues) => {
    setIsSubmitting(true)

    try {
      // Use consistent dayjs calculation for validity period
      const validityPeriod = calculateValidityPeriod(
        data.startDate,
        data.endDate
      )

      // Transform data for API
      const apiData = {
        fullName: data.name,
        countryCode: data.country,
        projectCode: data.projectCode,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: data.startDate,
        validityPeriod: Math.round(validityPeriod), // Round to nearest year
      }

      await axios.post(API_ENDPOINTS.REQUESTS, apiData)

      toast.success('Financing request submitted successfully!')
      reset()
      setIsOpec(false) // Reset OPEC state as well
    } catch (error: unknown) {
      console.error('Submission error:', error)

      // Improved error handling with specific error messages
      let errorMessage = 'Failed to submit request. Please try again.'

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status
          const data = error.response.data

          switch (status) {
            case 400:
              errorMessage =
                'Invalid request data. Please check your information and try again.'
              break
            case 401:
              errorMessage =
                'Authentication required. Please log in and try again.'
              break
            case 403:
              errorMessage =
                'Access denied. You do not have permission to submit this request.'
              break
            case 409:
              errorMessage =
                'A request with this project code already exists. Please use a different project code.'
              break
            case 422:
              errorMessage =
                'Validation error. Please check your form data and try again.'
              break
            case 500:
              errorMessage = 'Server error. Please try again later.'
              break
            default:
              errorMessage =
                data?.message || `Server error (${status}). Please try again.`
          }
        } else if (error.request) {
          // Network error
          errorMessage =
            'Network error. Please check your internet connection and try again.'
        } else {
          // Other error
          errorMessage =
            error.message || 'An unexpected error occurred. Please try again.'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Live region for form validation announcements
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Live region for form validation announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {hasErrors &&
          `Form has ${Object.keys(errors).length} validation error${
            Object.keys(errors).length > 1 ? 's' : ''
          }`}
        {!hasErrors && isValid && 'Form is valid and ready to submit'}
      </div>

      <form
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Financing Request Form"
        noValidate
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

        {/* Personal Information Section */}
        <fieldset className="space-y-6">
          <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personal Information
          </legend>

          {/* Name/Surname */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Name/Surname *
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              aria-describedby="name-error"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Origin Country *
            </label>
            <select
              id="country"
              aria-describedby="country-error"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.country
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
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
              <p
                id="country-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.country.message}
              </p>
            )}
          </div>
        </fieldset>

        {/* Project Information Section */}
        <fieldset className="space-y-6">
          <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Information
          </legend>

          {/* Project Code */}
          <div>
            <label
              htmlFor="projectCode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Code *
            </label>
            <input
              id="projectCode"
              type="text"
              placeholder="e.g., ABCD-1234"
              aria-describedby="projectCode-error projectCode-help"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.projectCode
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('projectCode')}
            />
            {errors.projectCode && (
              <p
                id="projectCode-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.projectCode.message}
              </p>
            )}
            <p id="projectCode-help" className="mt-1 text-xs text-gray-500">
              Format: XXXX-XXXX (4 capital letters, hyphen, 4 digits 1-9)
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              placeholder="Describe your financing request"
              rows={3}
              maxLength={FORM_LIMITS.DESCRIPTION_MAX_LENGTH}
              aria-describedby="description-error description-counter"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p
                id="description-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
            <p id="description-counter" className="mt-1 text-xs text-gray-500">
              {watch('description')?.length || 0}/
              {FORM_LIMITS.DESCRIPTION_MAX_LENGTH} characters
            </p>
          </div>
        </fieldset>

        {/* Financial Information Section */}
        <fieldset className="space-y-6">
          <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Information
          </legend>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Payment Amount *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              aria-describedby="amount-error"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p
                id="amount-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Currency *
            </label>
            {isOpec ? (
              <div className="flex items-center space-x-2">
                <input
                  id="currency"
                  type="text"
                  value="USD"
                  disabled
                  aria-describedby="currency-help"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 transition-colors duration-200"
                />
                <p id="currency-help" className="text-sm text-gray-500">
                  USD is automatically selected for OPEC member countries
                </p>
              </div>
            ) : (
              <select
                id="currency"
                aria-describedby="currency-error"
                aria-required="true"
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.currency
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500'
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
              <p
                id="currency-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.currency.message}
              </p>
            )}
          </div>
        </fieldset>

        {/* Validity Period Section */}
        <fieldset className="space-y-6">
          <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Validity Period
          </legend>

          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              min={minStartDate}
              aria-describedby="startDate-error startDate-help"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startDate
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('startDate')}
            />
            {errors.startDate && (
              <p
                id="startDate-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.startDate.message}
              </p>
            )}
            <p id="startDate-help" className="mt-1 text-xs text-gray-500">
              You can only select a start date at least{' '}
              {VALIDITY_PERIOD.MIN_DAYS_FROM_NOW} days from today.
            </p>
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              aria-describedby="endDate-error endDate-help"
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endDate
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              {...register('endDate')}
            />
            {errors.endDate && (
              <p
                id="endDate-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.endDate.message}
              </p>
            )}
            <p id="endDate-help" className="mt-1 text-xs text-gray-500">
              Validity period must be between {VALIDITY_PERIOD.MIN_YEARS}-
              {VALIDITY_PERIOD.MAX_YEARS} years
            </p>
          </div>
        </fieldset>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          aria-describedby="submit-status"
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isSubmitting || !isValid
              ? 'bg-gray-400 text-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Financing Request'}
        </button>

        <div id="submit-status" className="sr-only" aria-live="polite">
          {isSubmitting ? 'Form is being submitted' : 'Form is ready to submit'}
        </div>
      </form>
    </div>
  )
}

export default FinancingForm
