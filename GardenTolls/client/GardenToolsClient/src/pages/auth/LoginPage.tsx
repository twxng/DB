import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Helmet } from 'react-helmet';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockOutlinedIcon,
} from '@mui/icons-material';
import authService from '../../api/authService';
import type { LoginDto } from '../../types/index';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      Email: '',
      Password: '',
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email: data.Email, passwordLength: data.Password?.length });
      const response = await authService.login(data);
      
      if (response.isSuccess) {
        console.log('Login successful');
        navigate('/');
      } else {
        console.error('Login failed:', response.message);
        setError(response.message || 'Помилка входу в систему');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response && err.response.data) {
          console.error('Response data:', err.response.data);
          // Якщо є повідомлення про помилку від сервера, показуємо його
          if (err.response.data.message) {
            setError(err.response.data.message);
          } else if (typeof err.response.data === 'string') {
            setError(err.response.data as string);
          } else {
            setError('Сталася помилка під час входу. Спробуйте пізніше.');
          }
        } else {
          setError('Сталася помилка під час входу. Спробуйте пізніше.');
        }
      } else {
        setError('Сталася помилка під час входу. Спробуйте пізніше.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Вхід - Garden Tools</title>
        <meta name="description" content="Увійдіть в особистий кабінет, щоб отримати доступ до вашого облікового запису, історії замовлень та інших можливостей." />
      </Helmet>
      
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            mb: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2,
              backgroundColor: 'rgba(23, 33, 25, 0.8)',
              color: '#fff',
              border: '1px solid rgba(127, 255, 212, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ m: 1, bgcolor: '#7fffd4', color: '#172119' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#7fffd4' }}>
                Вхід в систему
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                name="Email"
                control={control}
                rules={{
                  required: 'Email обов\'язковий',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: 'Неправильний формат email',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    name="Email"
                    label="Email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.Email}
                    helperText={errors.Email?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': {
                          borderColor: 'rgba(127, 255, 212, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#7fffd4',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#7fffd4',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7fffd4',
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiFormHelperText-root.Mui-error': {
                        color: '#f44336',
                      },
                    }}
                  />
                )}
              />
              
              <Controller
                name="Password"
                control={control}
                rules={{
                  required: 'Пароль обов\'язковий',
                  minLength: {
                    value: 6,
                    message: 'Пароль повинен містити не менше 6 символів',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="Password"
                    autoComplete="current-password"
                    error={!!errors.Password}
                    helperText={errors.Password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: 'rgba(127, 255, 212, 0.7)' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': {
                          borderColor: 'rgba(127, 255, 212, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#7fffd4',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#7fffd4',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#7fffd4',
                      },
                      '& .MuiFormHelperText-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiFormHelperText-root.Mui-error': {
                        color: '#f44336',
                      },
                    }}
                  />
                )}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  backgroundColor: '#7fffd4',
                  color: '#172119',
                  '&:hover': {
                    backgroundColor: '#66ccb3',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(127, 255, 212, 0.3)',
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} sx={{ color: '#172119' }} /> : 'Увійти'}
              </Button>
              
              <Grid container>
                <Grid sx={{ flexGrow: 1 }}>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2"
                    sx={{
                      color: '#7fffd4',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Забули пароль?
                  </Link>
                </Grid>
                <Grid>
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body2"
                    sx={{
                      color: '#7fffd4',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    {"Немає облікового запису? Зареєструватися"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default LoginPage; 