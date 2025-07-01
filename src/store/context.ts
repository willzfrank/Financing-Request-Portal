import { createContext } from 'react'

export type Country = {
  label: string
  value: string
}

export type Currency = {
  [key: string]: string
}

export interface AppContextValue {
  countries: Country[]
  currencies: Currency
  isLoading: boolean
}

export const AppContext = createContext<AppContextValue | null>(null)
