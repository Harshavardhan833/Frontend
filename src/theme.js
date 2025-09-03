import { createTheme } from '@mui/material/styles';

// --- Light Theme Configuration ---
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3A86FF', // Vibrant blue
    },
    background: {
      default: '#F4F6F8', // Light greyish blue
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0B2545', // Dark blue
      secondary: '#5E6E82', // Greyish blue
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

// --- Dark Theme Configuration ---
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5A9BFF', // A slightly lighter blue for dark mode
    },
    background: {
      default: '#121212', // Standard dark background
      paper: '#1E1E1E',   // Slightly lighter for cards and surfaces
    },
    text: {
      primary: '#E0E0E0', // Light grey for primary text
      secondary: '#A0A0A0', // Darker grey for secondary text
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});
