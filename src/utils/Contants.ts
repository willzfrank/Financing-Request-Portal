import * as yup from 'yup'
import dayjs from 'dayjs'

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
    .max(150, 'Description must be 150 characters or less')
    .required('Description is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  currency: yup.string().required('Currency is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('validity-period', 'Invalid validity period', function (value) {
      if (!value) return false

      const start = dayjs('2025-07-01') // Hardcoded start date
      const end = dayjs(value)

      // Check if end date is after start date
      if (end.isBefore(start) || end.isSame(start)) {
        return this.createError({
          message: 'End date must be after start date',
        })
      }

      // Calculate validity period in years
      const validityPeriod = end.diff(start, 'year', true)

      // Check if validity period is between 1 and 3 years
      if (validityPeriod < 1) {
        return this.createError({
          message: 'Validity period must be at least 1 year',
        })
      }
      if (validityPeriod > 3) {
        return this.createError({
          message: 'Validity period cannot exceed 3 years',
        })
      }

      return true
    }),
})
