import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormClearErrors, UseFormTrigger, UseFormGetValues } from 'react-hook-form';
import { Helmet } from 'react-helmet';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAddAlt as PersonAddAltIcon,
} from '@mui/icons-material';
import authService from '../../api/authService';
import type { RegisterDto } from '../../types/index';

// Типи для компонента другого кроку
interface SecondStepFieldsProps {
  control: Control<RegisterDto>;
  errors: FieldErrors<RegisterDto>;
  clearErrors: UseFormClearErrors<RegisterDto>;
  trigger: UseFormTrigger<RegisterDto>;
  getValues: UseFormGetValues<RegisterDto>;
}

// Додаємо функцію-обгортку для форми другого кроку, щоб відокремити контекст валідації
const SecondStepFields = ({ control, errors, clearErrors, trigger }: SecondStepFieldsProps) => {
  // Додаткова перевірка перед рендерингом полів другого кроку
  useEffect(() => {
    // Очищаємо всі помилки минулого кроку при першому рендері
    clearErrors(['FirstName', 'LastName', 'Phone']);
  }, [clearErrors]);

  return (
    <>
      <Controller
        name="FirstName"
        control={control}
        defaultValue=""
        rules={{
          required: "Ім'я обов'язкове",
          maxLength: {
            value: 50,
            message: "Ім'я не може перевищувати 50 символів",
          },
        }}
        render={({ field }) => (
          <TextField
            value={field.value}
            onChange={(e) => {
              field.onChange(e);
              // Примусово очищаємо помилки для цього поля при зміні
              if (errors.FirstName) {
                // Використовуємо setTimeout, щоб дати React Hook Form час на оновлення стану
                setTimeout(() => {
                  clearErrors('FirstName');
                }, 0);
              }
            }}
            onBlur={(e) => {
              field.onBlur();
              // Перевіряємо поле при втраті фокусу
              if (e.target.value) {
                trigger('FirstName');
              }
            }}
            margin="normal"
            required
            fullWidth
            id="firstName"
            name="FirstName" 
            label="Ім'я"
            autoComplete="given-name"
            error={!!errors.FirstName}
            helperText={errors.FirstName?.message || "Заповніть ваше ім'я"}
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
            inputProps={{
              autoComplete: "given-name",
              form: {
                autoComplete: "off",
              },
            }}
          />
        )}
      />
      
      <Controller
        name="LastName"
        control={control}
        defaultValue=""
        rules={{
          required: "Прізвище обов'язкове",
          maxLength: {
            value: 50,
            message: "Прізвище не може перевищувати 50 символів",
          },
        }}
        render={({ field }) => (
          <TextField
            value={field.value}
            onChange={(e) => {
              field.onChange(e);
              // Примусово очищаємо помилки для цього поля при зміні
              if (errors.LastName) {
                // Використовуємо setTimeout, щоб дати React Hook Form час на оновлення стану
                setTimeout(() => {
                  clearErrors('LastName');
                }, 0);
              }
            }}
            onBlur={(e) => {
              field.onBlur();
              // Перевіряємо поле при втраті фокусу
              if (e.target.value) {
                trigger('LastName');
              }
            }}
            margin="normal"
            required
            fullWidth
            id="lastName"
            name="LastName"
            label="Прізвище"
            autoComplete="family-name"
            error={!!errors.LastName}
            helperText={errors.LastName?.message || "Заповніть ваше прізвище"}
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
              '&.Mui-focused fieldset': {
                borderColor: '#7fffd4 !important',
              },
            }}
            inputProps={{
              autoComplete: "family-name",
              form: {
                autoComplete: "off",
              },
            }}
          />
        )}
      />
      
      <Controller
        name="Phone"
        control={control}
        defaultValue=""
        rules={{
          required: "Телефон обов'язковий",
          pattern: {
            value: /^[+]?[0-9]{10,13}$/,
            message: 'Неправильний формат телефону',
          },
          maxLength: {
            value: 20,
            message: 'Телефон не може перевищувати 20 символів',
          },
        }}
        render={({ field }) => (
          <TextField
            value={field.value}
            onChange={(e) => {
              field.onChange(e);
              // Примусово очищаємо помилки для цього поля при зміні
              if (errors.Phone) {
                // Використовуємо setTimeout, щоб дати React Hook Form час на оновлення стану
                setTimeout(() => {
                  clearErrors('Phone');
                }, 0);
              }
            }}
            onBlur={(e) => {
              field.onBlur();
              // Перевіряємо поле при втраті фокусу
              if (e.target.value) {
                trigger('Phone');
              }
            }}
            margin="normal"
            required
            fullWidth
            id="phone"
            name="Phone"
            label="Телефон"
            autoComplete="tel"
            placeholder="+380XXXXXXXXX"
            error={!!errors.Phone}
            helperText={errors.Phone?.message || "Введіть номер телефону у форматі +380XXXXXXXX"}
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
            inputProps={{
              autoComplete: "tel",
              form: {
                autoComplete: "off",
              },
            }}
          />
        )}
      />
    </>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Облікові дані', 'Особиста інформація'];

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    clearErrors,
    watch,
    setValue,
    reset,
  } = useForm<RegisterDto>({
    defaultValues: {
      Username: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      FirstName: '',
      LastName: '',
      Phone: '',
    },
    mode: 'onTouched',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
  });

  // Відслідковуємо зміни у полях форми
  const lastName = watch('LastName');
  const email = watch('Email');

  // Додаємо ефект для відслідковування та виведення значень полів в консоль
  useEffect(() => {
    console.log('Значення поля LastName:', lastName);
    console.log('Значення поля Email:', email);
    console.log('Поточні помилки у формі:', errors);
  }, [lastName, email, errors]);

  // Ініціалізація форми при завантаженні компонента
  useEffect(() => {
    // Очищаємо всі можливі помилки при ініціалізації
    clearErrors();
    
    // Явно встановлюємо початкові значення для полів
    reset({
      Username: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      FirstName: '',
      LastName: '',
      Phone: '',
    });
    
    console.log('Форма ініціалізована, початкові помилки очищені');
  }, [clearErrors, reset]);

  // Додаємо ефект для скидання помилок при зміні активного кроку
  useEffect(() => {
    console.log('Активний крок змінився на:', activeStep);
    // Очищаємо всі помилки при зміні кроку
    clearErrors();
  }, [activeStep, clearErrors]);

  // Додаємо ефект для повного скидання форми при зміні кроку
  useEffect(() => {
    console.log('Активний крок змінився на:', activeStep);
    // Очищаємо всі помилки при зміні кроку
    clearErrors();
    
    // При переході на крок 2, повністю скидаємо помилки для полів другого кроку
    if (activeStep === 1) {
      clearErrors(['FirstName', 'LastName', 'Phone']);
      // Перевіряємо форму на наявність заповнених полів
      const formValues = getValues();
      console.log('Значення полів форми на кроці 2:', {
        FirstName: formValues.FirstName,
        LastName: formValues.LastName,
        Phone: formValues.Phone,
      });
    }
  }, [activeStep, clearErrors, getValues]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNext = async () => {
    // Визначаємо поля для валідації залежно від поточного кроку
    const fieldsToValidate = activeStep === 0
      ? ['Username', 'Email', 'Password', 'ConfirmPassword']
      : ['FirstName', 'LastName', 'Phone'];
    
    // Запускаємо валідацію вказаних полів
    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate as Array<keyof RegisterDto>)
      : true;
    
    console.log(`Валідація кроку ${activeStep + 1}:`, isValid, 'поля:', fieldsToValidate);
    console.log('Поточні помилки після валідації:', errors);
    
    // Додаткове логування для другого кроку
    if (activeStep === 1) {
      const formValues = getValues();
      console.log('Перехід до завершення реєстрації, стан форми:', {
        Username: formValues.Username,
        Email: formValues.Email,
        FirstName: formValues.FirstName || '',
        LastName: formValues.LastName || '',
        Phone: formValues.Phone || '',
        hasPassword: !!formValues.Password,
        hasConfirmPassword: !!formValues.ConfirmPassword
      });
    }
    
    // Якщо поля валідні, переходимо до наступного кроку
    if (isValid) {
      // При переході на другий крок ініціалізуємо поля особистої інформації
      // якщо вони ще не заповнені
      if (activeStep === 0) {
        // Повністю очищаємо всі помилки перед переходом до наступного кроку
        clearErrors();
        
        // Отримуємо поточні значення
        const formValues = getValues();
        
        // Встановлюємо порожні рядки для незаповнених полів
        if (!formValues.FirstName) setValue('FirstName', '');
        if (!formValues.LastName) setValue('LastName', '');
        if (!formValues.Phone) setValue('Phone', '');
        
        // Затримка для запобігання проблем з оновленням стану
        setTimeout(() => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
          
          // Додаткова перевірка що ми не маємо помилок валідації на другому кроці
          // через затримку в один кадр анімації
          setTimeout(() => {
            clearErrors(['FirstName', 'LastName', 'Phone']);
          }, 50);
        }, 0);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } else {
      console.warn('Валідація не пройдена для полів:', fieldsToValidate);
      console.warn('Поточні помилки:', errors);
    }
  };

  const handleBack = () => {
    // Очищаємо всі помилки валідації при переході назад
    clearErrors();
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: RegisterDto) => {
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Явно форматуємо всі поля відповідно до API ендпоінту
      const registerData: RegisterDto = {
        Username: data.Username.trim(),
        Email: data.Email.trim(),
        Password: data.Password,
        ConfirmPassword: data.ConfirmPassword,
        FirstName: data.FirstName ? data.FirstName.trim() : '',
        LastName: data.LastName ? data.LastName.trim() : '',
        Phone: data.Phone ? data.Phone.trim() : ''
      };
      
      // Логуємо дані для відлагодження (без паролів)
      console.log('Реєстрація користувача - дані для відправки:', { 
        Username: registerData.Username,
        Email: registerData.Email,
        FirstName: registerData.FirstName,
        LastName: registerData.LastName,
        Phone: registerData.Phone,
        // Паролі не логуємо з міркувань безпеки
        hasPassword: !!registerData.Password,
        hasConfirmPassword: !!registerData.ConfirmPassword
      });
      
      // Відправляємо дані на сервер
      const response = await authService.register(registerData);
      
      if (response.isSuccess) {
        console.log('Реєстрація успішна:', response);
        navigate('/');
      } else {
        console.error('Помилка реєстрації:', response.message);
        setError(response.message || 'Помилка реєстрації');
      }
    } catch (err: unknown) {
      console.error('Сталася помилка під час реєстрації:', err);
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 
          'message' in err.response.data) {
        setError(err.response.data.message as string);
      } else {
        setError('Сталася помилка під час реєстрації. Спробуйте пізніше.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Реєстрація - Garden Tools</title>
        <meta name="description" content="Зареєструйтеся, щоб отримати доступ до всіх можливостей нашого магазину садових товарів." />
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
                <PersonAddAltIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mb: 3, color: '#7fffd4' }}>
                Реєстрація
              </Typography>
            </Box>
            
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-label': {
                  color: '#fff',
                },
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#7fffd4', 
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#7fffd4', 
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(127, 255, 212, 0.3)',
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#7fffd4',
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#7fffd4',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
                {error}
              </Alert>
            )}
            
            <Box 
              component="form" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }} 
              noValidate
            >
              {activeStep === 0 ? (
                // Крок 1: Облікові дані
                <>
                  <Controller
                    name="Username"
                    control={control}
                    rules={{
                      required: 'Ім\'я користувача обов\'язкове',
                      minLength: {
                        value: 3,
                        message: 'Ім\'я користувача повинно містити не менше 3 символів',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Ім\'я користувача не може перевищувати 50 символів',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Ім'я користувача"
                        autoComplete="username"
                        autoFocus
                        error={!!errors.Username}
                        helperText={errors.Username?.message}
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
                        label="Email"
                        autoComplete="email"
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
                        autoComplete="new-password"
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
                                type="button"
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
                  
                  <Controller
                    name="ConfirmPassword"
                    control={control}
                    rules={{
                      required: 'Підтвердження пароля обов\'язкове',
                      validate: (value) => 
                        value === getValues('Password') || 'Паролі не співпадають',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        required
                        fullWidth
                        label="Підтвердження пароля"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        autoComplete="new-password"
                        error={!!errors.ConfirmPassword}
                        helperText={errors.ConfirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                                sx={{ color: 'rgba(127, 255, 212, 0.7)' }}
                                type="button"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                </>
              ) : (
                // Крок 2: Особиста інформація - використовуємо окремий компонент
                <SecondStepFields 
                    control={control}
                  errors={errors} 
                  clearErrors={clearErrors} 
                  trigger={trigger} 
                  getValues={getValues}
                />
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  type="button"
                  sx={{ 
                    mr: 1,
                    color: '#7fffd4',
                    '&:hover': {
                      backgroundColor: 'rgba(127, 255, 212, 0.1)',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Назад
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      backgroundColor: '#7fffd4',
                      color: '#172119',
                      '&:hover': {
                        backgroundColor: '#66ccb3',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(127, 255, 212, 0.3)',
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} sx={{ color: '#172119' }} /> : 'Зареєструватися'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault(); // Запобігаємо відправці форми
                      handleNext();
                    }}
                    sx={{
                      backgroundColor: '#7fffd4',
                      color: '#172119',
                      '&:hover': {
                        backgroundColor: '#66ccb3',
                      }
                    }}
                  >
                    Далі
                  </Button>
                )}
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{
                    color: '#7fffd4',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Вже маєте обліковий запис? Увійти
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default RegisterPage; 