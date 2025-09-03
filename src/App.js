import React from 'react';
import { useSelector } from 'react-redux';
import LoginPage from './components/LoginPage';
import Dashboard from './components/dashboard';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ekaLogo from '../src/logo_New.png';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#0d60dbff',
      },
      secondary: {
        main: '#6c757d',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? <Dashboard logo={ekaLogo} /> : <LoginPage />}
    </ThemeProvider>
  );
}

export default App;