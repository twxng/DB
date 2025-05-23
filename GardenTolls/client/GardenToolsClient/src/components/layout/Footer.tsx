import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  TextField,
  Button,
  Divider,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Send as SendIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import logo from '../../assets/logo.png';

// Константи для єдиної кольорової схеми сайту
const COLORS = {
  primary: '#7fffd4',
  primaryDark: '#5ecfaa',
  primaryLight: 'rgba(127, 255, 212, 0.3)',
  background: '#121914',
  bgLight: 'rgba(255, 255, 255, 0.95)',
  bgDark: 'rgba(23, 33, 25, 0.9)',
  text: '#ffffff',
  textDark: '#172119',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(127, 255, 212, 0.2)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

const Footer = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Логіка обробки підписки на розсилку
    alert('Дякуємо за підписку!');
  };

  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: COLORS.background,
        color: COLORS.text,
        pt: { xs: 4, md: 5 },
        pb: { xs: 2, md: 3 },
        mt: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: '800px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${COLORS.primary}, transparent)`,
          opacity: 0.8,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(127, 255, 212, 0.03) 0%, transparent 80%)',
          opacity: 0.4,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Логотип та інформація */}
          <Grid item xs={12} md={4}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                mb: 1.5,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                }
              }}
            >
              <Typography 
                variant="h6"
                fontWeight="bold" 
                letterSpacing=".5px"
                sx={{
                  background: `linear-gradient(90deg, ${COLORS.text} 0%, ${COLORS.primary} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Garden Tools
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(127, 255, 212, 0.1)',
                    mr: 1
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                </Box>
                <Typography variant="body2" fontSize="0.8rem">
                  м. Київ, вул. Садова, 123
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(127, 255, 212, 0.1)',
                    mr: 1
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                </Box>
                <Link 
                  href="tel:+380501234567" 
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    fontSize: "0.8rem",
                    transition: 'color 0.2s ease',
                    '&:hover': { color: COLORS.primary }
                  }}
                >
                  +38 (050) 123-45-67
                </Link>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(127, 255, 212, 0.1)',
                    mr: 1
                  }}
                >
                  <EmailIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                </Box>
                <Link 
                  href="mailto:info@garden-tools.com" 
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    fontSize: "0.8rem",
                    transition: 'color 0.2s ease',
                    '&:hover': { color: COLORS.primary }
                  }}
                >
                  info@garden-tools.com
                </Link>
              </Box>
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                aria-label="facebook"
                size="small"
                sx={{ 
                  color: COLORS.text,
                  bgcolor: 'rgba(127, 255, 212, 0.1)',
                  transition: 'all 0.3s ease',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: COLORS.primary,
                    color: COLORS.textDark,
                    transform: 'translateY(-3px)',
                  }
                }}
              >
                <FacebookIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                aria-label="instagram"
                size="small"
                sx={{ 
                  color: COLORS.text,
                  bgcolor: 'rgba(127, 255, 212, 0.1)',
                  transition: 'all 0.3s ease',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: COLORS.primary,
                    color: COLORS.textDark,
                    transform: 'translateY(-3px)',
                  }
                }}
              >
                <InstagramIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                aria-label="twitter"
                size="small"
                sx={{ 
                  color: COLORS.text,
                  bgcolor: 'rgba(127, 255, 212, 0.1)',
                  transition: 'all 0.3s ease',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: COLORS.primary,
                    color: COLORS.textDark,
                    transform: 'translateY(-3px)',
                  }
                }}
              >
                <TwitterIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                href="https://youtube.com"
                target="_blank"
                rel="noopener"
                aria-label="youtube"
                size="small"
                sx={{ 
                  color: COLORS.text,
                  bgcolor: 'rgba(127, 255, 212, 0.1)',
                  transition: 'all 0.3s ease',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: COLORS.primary,
                    color: COLORS.textDark,
                    transform: 'translateY(-3px)',
                  }
                }}
              >
                <YouTubeIcon fontSize="small" sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Grid>

          {/* Посилання */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography 
              variant="subtitle1"
              sx={{ 
                mb: 1.5,
                fontWeight: 600, 
                position: 'relative', 
                display: 'inline-block',
                color: COLORS.text,
                fontSize: "0.9rem",
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: 30,
                  height: 2,
                  bgcolor: COLORS.primary,
                  borderRadius: '2px'
                }
              }}
            >
              Інформація
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                component={RouterLink} 
                to="/about" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Про нас
              </Link>
              <Link 
                component={RouterLink} 
                to="/delivery" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Доставка
              </Link>
              <Link 
                component={RouterLink} 
                to="/payment" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Оплата
              </Link>
              <Link 
                component={RouterLink} 
                to="/returns" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Повернення
              </Link>
              <Link 
                component={RouterLink} 
                to="/faq" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Категорії */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography 
              variant="subtitle1"
              sx={{ 
                mb: 1.5,
                fontWeight: 600, 
                position: 'relative', 
                display: 'inline-block',
                color: COLORS.text,
                fontSize: "0.9rem",
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: 30,
                  height: 2,
                  bgcolor: COLORS.primary,
                  borderRadius: '2px'
                }
              }}
            >
              Категорії
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                component={RouterLink} 
                to="/categories/garden-tools" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Садові інструменти
              </Link>
              <Link 
                component={RouterLink} 
                to="/categories/irrigation" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Системи поливу
              </Link>
              <Link 
                component={RouterLink} 
                to="/categories/plants" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Рослини та насіння
              </Link>
              <Link 
                component={RouterLink} 
                to="/categories/fertilizers" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Добрива
              </Link>
              <Link 
                component={RouterLink} 
                to="/categories/pots" 
                color="inherit" 
                underline="none"
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: "0.8rem",
                  '&:hover': { 
                    color: COLORS.primary,
                    transform: 'translateX(5px)'
                  },
                }}
              >
                <ArrowIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7, color: COLORS.primary }} />
                Горщики та кашпо
              </Link>
            </Box>
          </Grid>

          {/* Підписка на розсилку */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="subtitle1"
              sx={{ 
                mb: 1.5,
                fontWeight: 600, 
                position: 'relative', 
                display: 'inline-block',
                color: COLORS.text,
                fontSize: "0.9rem",
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: 30,
                  height: 2,
                  bgcolor: COLORS.primary,
                  borderRadius: '2px'
                }
              }}
            >
              Підписка на новини
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1.5,
                opacity: 0.9, 
                lineHeight: 1.4,
                fontSize: "0.8rem"
              }}
            >
              Підпишіться на розсилку та отримайте знижку 10% на перше замовлення
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 1.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Введіть ваш email"
                size="small"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        type="submit"
                        sx={{ 
                          minWidth: 'auto', 
                          bgcolor: COLORS.primary, 
                          color: COLORS.textDark,
                          p: '4px',
                          borderRadius: '0 4px 4px 0',
                          '&:hover': {
                            bgcolor: COLORS.primaryDark,
                          }
                        }}
                      >
                        <SendIcon sx={{ fontSize: 16 }} />
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(127, 255, 212, 0.2)',
                      borderWidth: '1px',
                      transition: 'all 0.2s ease',
                      borderRight: 'none',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(127, 255, 212, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.primary,
                      borderWidth: '1px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: 1,
                    fontSize: '0.8rem',
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(127, 255, 212, 0.1)', my: 2 }} />

        {/* Копірайт */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', md: 'center' }, 
          gap: { xs: 1, md: 0 },
          py: 1
        }}>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
            © {currentYear} Garden Tools. Всі права захищено.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
            <Link 
              component={RouterLink}
              to="/privacy" 
              color="inherit" 
              underline="hover"
              sx={{ 
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  opacity: 1,
                  color: COLORS.primary
                },
              }}
            >
              Політика конфіденційності
            </Link>
            <Link 
              component={RouterLink}
              to="/terms" 
              color="inherit" 
              underline="hover"
              sx={{ 
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  opacity: 1,
                  color: COLORS.primary
                },
              }}
            >
              Умови використання
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 