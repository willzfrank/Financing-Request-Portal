import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AppContext } from './context'
import type { Country, Currency } from './context'
import { API_ENDPOINTS } from '../utils/Constants'

interface CountryApiResponse {
  name: {
    common: string
  }
  cca2: string
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Currency>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        // Fetch countries and currencies in parallel
        const [countriesResponse, currenciesResponse] =
          await Promise.allSettled([
            axios.get<CountryApiResponse[]>(API_ENDPOINTS.COUNTRIES),
            axios.get<Currency>(API_ENDPOINTS.CURRENCIES),
          ])

        // Handle countries response
        if (countriesResponse.status === 'fulfilled') {
          const sortedCountries: Country[] = countriesResponse.value.data
            .sort((a: CountryApiResponse, b: CountryApiResponse) =>
              a.name.common.localeCompare(b.name.common)
            )
            .map((country: CountryApiResponse) => ({
              label: country.name.common,
              value: country.cca2,
            }))
          setCountries(sortedCountries)
        } else {
          console.error('Failed to fetch countries:', countriesResponse.reason)
          toast.error('Failed to load countries. Using fallback list.')
          // Fallback to basic country list
          setCountries([
            { label: 'United States', value: 'US' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Germany', value: 'DE' },
            { label: 'France', value: 'FR' },
            { label: 'Canada', value: 'CA' },
            { label: 'Australia', value: 'AU' },
            { label: 'Japan', value: 'JP' },
            { label: 'China', value: 'CN' },
            { label: 'India', value: 'IN' },
            { label: 'Brazil', value: 'BR' },
          ])
        }

        // Handle currencies response
        if (currenciesResponse.status === 'fulfilled') {
          setCurrencies(currenciesResponse.value.data)
        } else {
          console.error(
            'Failed to fetch currencies:',
            currenciesResponse.reason
          )
          toast.error('Failed to load currencies. Using fallback list.')
          // Fallback to basic currencies
          setCurrencies({
            USD: 'US Dollar',
            EUR: 'Euro',
            GBP: 'British Pound',
            JPY: 'Japanese Yen',
            CAD: 'Canadian Dollar',
            AUD: 'Australian Dollar',
            CHF: 'Swiss Franc',
            CNY: 'Chinese Yuan',
            INR: 'Indian Rupee',
            BRL: 'Brazilian Real',
          })
        }
      } catch (error) {
        console.error('Unexpected error during data fetching:', error)
        toast.error('Failed to load application data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <AppContext.Provider value={{ countries, currencies, isLoading }}>
      {children}
    </AppContext.Provider>
  )
}
