import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { AppContext } from './context'
import type { Country, Currency } from './context'

interface CountryApiResponse {
  name: {
    common: string
  }
  cca2: string
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Currency>({})

  useEffect(() => {
    // Fetch countries
    axios
      .get<CountryApiResponse[]>(
        'https://restcountries.com/v3.1/all?fields=name,cca2'
      )
      .then((res) => {
        const sortedCountries: Country[] = res.data
          .sort((a: CountryApiResponse, b: CountryApiResponse) =>
            a.name.common.localeCompare(b.name.common)
          )
          .map((country: CountryApiResponse) => ({
            label: country.name.common,
            value: country.cca2,
          }))

        setCountries(sortedCountries)
      })
      .catch((error) => {
        console.error('Failed to fetch countries:', error)
        // Fallback to basic country list
        setCountries([
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'Germany', value: 'DE' },
          { label: 'France', value: 'FR' },
          { label: 'Canada', value: 'CA' },
        ])
      })

    // Fetch currencies
    axios
      .get<Currency>('https://openexchangerates.org/api/currencies.json')
      .then((res) => setCurrencies(res.data))
      .catch((error) => {
        console.error('Failed to fetch currencies:', error)
        // Fallback to basic currencies
        setCurrencies({
          USD: 'US Dollar',
          EUR: 'Euro',
          GBP: 'British Pound',
          JPY: 'Japanese Yen',
          CAD: 'Canadian Dollar',
        })
      })
  }, [])

  return (
    <AppContext.Provider value={{ countries, currencies }}>
      {children}
    </AppContext.Provider>
  )
}
