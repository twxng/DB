import { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <CssBaseline />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
          py: { xs: 2, md: 3 },
          px: { xs: 0, sm: 0, md: 0 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 