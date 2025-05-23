import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Типи для контексту
interface CategoryMenuContextType {
  isCategoryMenuOpen: boolean;
  openCategoryMenu: () => void;
  closeCategoryMenu: () => void;
  toggleCategoryMenu: () => void;
}

// Створення контексту з початковими значеннями
const CategoryMenuContext = createContext<CategoryMenuContextType>({
  isCategoryMenuOpen: false,
  openCategoryMenu: () => {},
  closeCategoryMenu: () => {},
  toggleCategoryMenu: () => {},
});

// Провайдер контексту
interface CategoryMenuProviderProps {
  children: ReactNode;
}

export const CategoryMenuProvider: React.FC<CategoryMenuProviderProps> = ({ children }) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const openCategoryMenu = () => setIsCategoryMenuOpen(true);
  const closeCategoryMenu = () => setIsCategoryMenuOpen(false);
  const toggleCategoryMenu = () => setIsCategoryMenuOpen(prev => !prev);

  return (
    <CategoryMenuContext.Provider 
      value={{ 
        isCategoryMenuOpen, 
        openCategoryMenu, 
        closeCategoryMenu, 
        toggleCategoryMenu 
      }}
    >
      {children}
    </CategoryMenuContext.Provider>
  );
};

// Хук для використання контексту
export const useCategoryMenuContext = () => useContext(CategoryMenuContext); 