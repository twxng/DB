import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import theme from './theme';

import { CategoryMenuProvider } from './contexts/CategoryMenuContext';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CategoryMenuProvider>
          <Router>
            <AppRoutes />
          </Router>
        </CategoryMenuProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
