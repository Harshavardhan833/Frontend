import React, { useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
  SettingsOutlined,
  HelpOutline
} from '@mui/icons-material';
import { loginUser } from '../store/authSlice';
// Make sure you have a logo image in src/ or update the path
// import EkaLogo from '../EKA_logo.png'; 

const loginReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'TOGGLE_PASSWORD_VISIBILITY':
      return { ...state, showPassword: !state.showPassword };
    default:
      return state;
  }
};

const initialState = {
  email: '',
  password: '',
  showPassword: false,
};

const LoginPage = () => {
  const [state, localDispatch] = useReducer(loginReducer, initialState);
  const { email, password, showPassword } = state;

  const reduxDispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    reduxDispatch(loginUser({ email, password }));
  };

  const handleFieldChange = (e) => {
    localDispatch({
      type: 'SET_FIELD',
      payload: { field: e.target.name, value: e.target.value },
    });
  };

  const togglePasswordVisibility = () => {
    localDispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY' });
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4087f1ff, #0d60dbff)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 2 }}>
        <IconButton sx={{ color: 'white' }}>
          <SettingsOutlined />
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <HelpOutline />
        </IconButton>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(9, 110, 241, 0.1)',
          bgcolor: 'white',
          textAlign: 'center',
        }}
      >
        <Box mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary">EKA Connect</Typography>
          {/* <img src={EkaLogo} alt="EKA Connect" style={{ width: 120 }} /> */}
        </Box>

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            placeholder="Enter Email"
            value={email}
            onChange={handleFieldChange}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            placeholder="Enter Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleFieldChange}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box textAlign="right" mt={1}>
            <Link href="#" underline="hover" fontSize="0.85rem">
              Forgot your password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, textTransform: 'none', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
          </Button>

          <Typography variant="body2" mt={3}>
            Don't have an account?{' '}
            <Link href="#" underline="hover">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;