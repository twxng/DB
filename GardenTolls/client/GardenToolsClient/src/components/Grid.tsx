import * as React from 'react';
import { Grid as MuiGrid, styled } from '@mui/material';
import type { GridProps } from '@mui/material';

// Створюємо проміжний компонент, який автоматично встановлює правильні props для item та container
const StyledGrid = styled(MuiGrid)({});

interface CustomGridProps extends GridProps {
  item?: boolean;
  container?: boolean;
  children?: React.ReactNode;
}

// Вирішує проблему з типізацією для Grid компонентів з item та container props
const Grid = React.forwardRef<HTMLDivElement, CustomGridProps>(
  (props, ref) => {
    return <StyledGrid ref={ref} {...props} />;
  }
);

Grid.displayName = 'Grid';

export default Grid; 