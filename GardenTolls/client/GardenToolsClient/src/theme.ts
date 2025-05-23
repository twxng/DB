import { createTheme } from '@mui/material/styles';

// Створюємо тему в садовому стилі з покращеними кольорами
const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiPopover: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
      },
    },
  },
  palette: {
    glassmorphism: {
      backdrop: {
        blur: '15px',
      },
      background: {
        light: 'rgba(255, 255, 255, 0.11)',
        dark: 'rgba(199, 179, 179, 0.88)',
      },
      border: {
        light: 'rgba(255, 255, 255, 0.2)',
        dark: 'rgba(255, 255, 255, 0.15)',
      },
      shadow: {
        light: '0 8px 24px rgba(36, 36, 36, 0.26)',
        dark: '0 12px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
});

// Розширюємо інтерфейс типів теми
declare module '@mui/material/styles' {
  interface Palette {
    glassmorphism: {
      backdrop: {
        blur: string;
      };
      background: {
        light: string;
        dark: string;
      };
      border: {
        light: string;
        dark: string;
      };
      shadow: {
        light: string;
        dark: string;
      };
    };
  }
  
  interface PaletteOptions {
    glassmorphism?: {
      backdrop?: {
        blur?: string;
      };
      background?: {
        light?: string;
        dark?: string;
      };
      border?: {
        light?: string;
        dark?: string;
      };
      shadow?: {
        light?: string;
        dark?: string;
      };
    };
  }
}

export default theme; 