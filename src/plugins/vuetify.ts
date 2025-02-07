/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        // Define colors using Vuetify's theme structure
        colors: {
          primary: '#1f2943',  // Blue color (you can change this to any color you like)
          secondary: '#424242', // Secondary color
          accent: '#82B1FF',    // Accent color
          error: '#FF5252',     // Error color
          info: '#2196F3',      // Info color
          success: '#4CAF50',   // Success color
          warning: '#FB8C00',   // Warning color
        },
      },
    },
  },
})
