# Financing Request Portal

A React-based portal for accepting financing requests from representatives around the world. This application allows users to submit financing requests with specific validation rules and business logic.

## Features

- **Financing Request Form**: Complete form with all required fields
- **Validity Period**: 1-3 years validation with 15-day minimum start date
- **OPEC Country Logic**: Automatic USD currency enforcement for OPEC member countries
- **Project Code Validation**: XXXX-XXXX format (4 capital letters + 4 digits 1-9)
- **Responsive Design**: Works on both desktop and mobile browsers
- **Real-time Validation**: Form validation with immediate feedback

## Requirements Met

✅ **Core Functionality**

- Financing request form with user-selectable validity period (1-3 years)
- Minimum validity period start date (15 days from submission)
- All required fields: Name/Surname, Origin Country, Project Code, Description (150 chars), Payment Amount, Currency

✅ **Business Logic**

- OPEC member countries automatically use USD currency
- Non-OPEC countries allow user-defined currency selection
- Project code format validation (XXXX-XXXX)

✅ **Technical Implementation**

- React with TypeScript
- Context API for state management
- Form validation with Yup
- API integration for data submission
- Responsive design with Tailwind CSS

## Installation & Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## API Integration

The application integrates with:

- **Countries API**: https://restcountries.com/v3.1/all
- **Currencies API**: https://openexchangerates.org/api/currencies.json
- **Submission API**: http://test-noema-api.azurewebsites.net/api/requests

## Form Validation Rules

- **Name/Surname**: Required
- **Origin Country**: Required, dropdown selection
- **Project Code**: Required, format XXXX-XXXX (4 capital letters + 4 digits 1-9)
- **Description**: Required, maximum 150 characters
- **Payment Amount**: Required, positive number
- **Currency**: Required, USD for OPEC countries, user-selectable for others
- **Start Date**: Required, minimum 15 days from July 1st, 2025
- **End Date**: Required, validity period between 1-3 years

## OPEC Member Countries

The following countries automatically use USD currency:

- Algeria (DZ), Angola (AO), Congo (CG), Equatorial Guinea (GQ)
- Gabon (GA), Iran (IR), Iraq (IQ), Kuwait (KW)
- Libya (LY), Nigeria (NG), Saudi Arabia (SA)
- United Arab Emirates (AE), Venezuela (VE)

## Technologies Used

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Hook Form** for form management
- **Yup** for validation schemas
- **Axios** for API calls
- **Day.js** for date manipulation
- **Tailwind CSS** for styling
- **Context API** for state management

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
