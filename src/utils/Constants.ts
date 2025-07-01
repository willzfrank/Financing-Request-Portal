import * as yup from 'yup'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// Extend dayjs with the required plugin
dayjs.extend(isSameOrAfter)

// Constants to replace magic numbers
export const VALIDITY_PERIOD = {
  MIN_YEARS: 1,
  MAX_YEARS: 3,
  MIN_DAYS_FROM_NOW: 15,
} as const

export const FORM_LIMITS = {
  DESCRIPTION_MAX_LENGTH: 150,
} as const

export const API_ENDPOINTS = {
  REQUESTS: 'http://test-noema-api.azurewebsites.net/api/requests',
  COUNTRIES: 'https://restcountries.com/v3.1/all?fields=name,cca2',
  CURRENCIES: 'https://openexchangerates.org/api/currencies.json',
} as const

export const OPEC_COUNTRIES = [
  'DZ', // Algeria
  'AO', // Angola
  'CG', // Congo
  'GQ', // Equatorial Guinea
  'GA', // Gabon
  'IR', // Iran
  'IQ', // Iraq
  'KW', // Kuwait
  'LY', // Libya
  'NG', // Nigeria
  'SA', // Saudi Arabia
  'AE', // United Arab Emirates
  'VE', // Venezuela
]

// Helper function to calculate minimum start date
export const getMinStartDate = (): string => {
  const minDate = dayjs().add(VALIDITY_PERIOD.MIN_DAYS_FROM_NOW, 'day')
  return minDate.format('YYYY-MM-DD')
}

// Helper function to calculate validity period in years
export const calculateValidityPeriod = (
  startDate: string,
  endDate: string
): number => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return end.diff(start, 'year', true)
}

export const financingSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  country: yup.string().required('Country is required'),
  projectCode: yup
    .string()
    .matches(
      /^[A-Z]{4}-[1-9]{4}$/,
      'Invalid project code format (e.g., ABCD-1234)'
    )
    .required('Project code is required'),
  description: yup
    .string()
    .max(
      FORM_LIMITS.DESCRIPTION_MAX_LENGTH,
      `Description must be ${FORM_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`
    )
    .required('Description is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  currency: yup.string().required('Currency is required'),
  startDate: yup
    .string()
    .required('Start date is required')
    .test(
      'min-start-date',
      'Start date must be at least 15 days from today',
      function (value) {
        if (!value) return false
        const minDate = dayjs().add(VALIDITY_PERIOD.MIN_DAYS_FROM_NOW, 'day')
        const selectedDate = dayjs(value)
        return selectedDate.isSameOrAfter(minDate, 'day')
      }
    ),
  endDate: yup
    .string()
    .required('End date is required')
    .test('validity-period', 'Invalid validity period', function (value) {
      if (!value) return false

      const startDate = this.parent.startDate
      if (!startDate) return false

      const start = dayjs(startDate)
      const end = dayjs(value)

      // Check if end date is after start date
      if (end.isBefore(start) || end.isSame(start)) {
        return this.createError({
          message: 'End date must be after start date',
        })
      }

      // Calculate validity period in years using consistent dayjs calculation
      const validityPeriod = calculateValidityPeriod(startDate, value)

      // Check if validity period is between 1 and 3 years
      if (validityPeriod < VALIDITY_PERIOD.MIN_YEARS) {
        return this.createError({
          message: `Validity period must be at least ${VALIDITY_PERIOD.MIN_YEARS} year`,
        })
      }
      if (validityPeriod > VALIDITY_PERIOD.MAX_YEARS) {
        return this.createError({
          message: `Validity period cannot exceed ${VALIDITY_PERIOD.MAX_YEARS} years`,
        })
      }

      return true
    }),
})
