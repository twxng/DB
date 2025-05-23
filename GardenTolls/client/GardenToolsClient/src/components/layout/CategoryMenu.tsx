import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/CategoryMenu.css";
import categoryService from "../../api/categoryService";
import type { Category } from "../../types";
import {
  Spa,
  LocalFlorist,
  WbSunny,
  LocalDrink,
  Grass,
  Agriculture,
  AutoAwesome,
  EnergySavingsLeaf,
  KeyboardArrowDown,
  CategoryOutlined,
  ExpandMore,
  ChevronRight,
  AllInclusive,
  Menu as MenuIcon
} from "@mui/icons-material";

// Інтерфейс для категорій з підкатегоріями
interface CategoryWithSubcategories extends Category {
  subcategories?: Category[];
  showSubcategories?: boolean;
}

interface CategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingEffect, setLoadingEffect] = useState<string>("Завантаження");

  // Ефект анімації завантаження
  useEffect(() => {
    if (loadingCategories) {
      const interval = setInterval(() => {
        setLoadingEffect((prev) => {
          if (prev === "Завантаження...") return "Завантаження";
          return prev + ".";
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [loadingCategories]);

  // Завантаження категорій
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) return;

      setLoadingCategories(true);
      try {
        // Отримуємо всі категорії
        const response = await categoryService.getCategories();

        // Фільтруємо тільки активні категорії верхнього рівня
        const mainCategories = response.categories
          .filter((category) => category.isActive && !category.parentCategoryId)
          .map((category) => ({
            ...category,
            subcategories: [],
            showSubcategories: false,
          }));

        // Для кожної головної категорії завантажуємо підкатегорії
        const categoryPromises = mainCategories.map(async (category) => {
          try {
            const subcategoriesResponse =
              await categoryService.getSubcategories(category.categoryId);
            const activeSubcategories = subcategoriesResponse.categories.filter(
              (subcat) => subcat.isActive
            );
            return { ...category, subcategories: activeSubcategories };
          } catch (error) {
            console.error(
              `Помилка завантаження підкатегорій для ${category.name}:`,
              error
            );
            return category;
          }
        });

        const categoriesWithSubcategories = await Promise.all(categoryPromises);
        setCategories(categoriesWithSubcategories);
      } catch (error) {
        console.error("Помилка завантаження категорій:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, categories.length]);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Блокувати скролл коли меню відкрите
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = ""; // Відновити скролл
    };
  }, [isOpen, onClose]);

  // Показати/сховати підкатегорії при наведенні
  const handleCategoryMouseEnter = (categoryId: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        showSubcategories:
          cat.categoryId === categoryId ? true : cat.showSubcategories,
      }))
    );
  };

  const handleCategoryMouseLeave = (categoryId: number) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        showSubcategories:
          cat.categoryId === categoryId ? false : cat.showSubcategories,
      }))
    );
  };

  // Перехід до сторінки категорії
  const handleCategoryClick = (categoryId: number) => {
    navigate(`/categories/${categoryId}`);
    onClose();
  };

  const handleSubcategoryClick = (categoryId: number) => {
    navigate(`/categories/${categoryId}`);
    onClose();
  };

  // Функція для визначення іконки категорії
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const iconStyle = { 
      color: "white", 
      filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))",
      opacity: 1,
      fontSize: '1.6rem'
    };

    if (name.includes("інструмент")) return <Agriculture style={iconStyle} />;
    if (name.includes("посадковий") || name.includes("насіння"))
      return <LocalFlorist style={iconStyle} />;
    if (name.includes("добрива")) return <EnergySavingsLeaf style={iconStyle} />;
    if (name.includes("захист")) return <WbSunny style={iconStyle} />;
    if (name.includes("грунт")) return <Grass style={iconStyle} />;
    if (name.includes("полив")) return <LocalDrink style={iconStyle} />;

    return <Spa style={iconStyle} />;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="category-menu-overlay" onClick={onClose}></div>
      <div className="category-menu-wrapper">
        <div className="category-menu" ref={menuRef}>
          <div className="category-menu-header">
            <h2 className="category-menu-header-title">
              Категорії товарів
            </h2>
            <Link 
              to="/categories" 
              className="category-menu-all-button"
              onClick={onClose}
            >
              Усі категорії
            </Link>
          </div>
          
          <div className="category-menu-content-wrapper">
            {loadingCategories ? (
              <div className="category-menu-loading">
                <AutoAwesome style={{ marginRight: '10px', animation: 'softPulse 2s infinite alternate' }} />
                {loadingEffect}
              </div>
            ) : categories.length === 0 ? (
              <div className="category-menu-empty">
                <CategoryOutlined style={{ marginRight: '10px' }} />
                Немає доступних категорій
              </div>
            ) : (
              <div className="category-menu-layout">
                <div className="category-menu-sidebar">
                  {categories.map((category) => (
                    <div
                      key={category.categoryId}
                      className={`category-menu-item ${
                        category.showSubcategories ? "active" : ""
                      }`}
                      onClick={() => handleCategoryClick(category.categoryId)}
                      onMouseEnter={() =>
                        handleCategoryMouseEnter(category.categoryId)
                      }
                      onMouseLeave={() =>
                        handleCategoryMouseLeave(category.categoryId)
                      }
                    >
                      <div className="category-menu-item-content">
                        <div className="category-menu-item-text">
                          <div className="category-menu-item-icon">
                            {getCategoryIcon(category.name)}
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <ChevronRight
                          className={`category-menu-arrow ${
                            category.showSubcategories ? "active" : ""
                          }`}
                          fontSize="small"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="category-menu-subcategories">
                  {categories.some((c) => c.showSubcategories) ? (
                    <div className="selected-category-header">
                      <h3 className="selected-category-title">
                        {categories.find((c) => c.showSubcategories) && 
                          getCategoryIcon(categories.find((c) => c.showSubcategories)?.name || "")}
                        <span>
                          {categories.find((c) => c.showSubcategories)?.name}
                        </span>
                      </h3>
                    </div>
                  ) : null}

                  {categories.map((category) => (
                    <div
                      key={`subcategories-${category.categoryId}`}
                      className={`subcategories-panel ${
                        category.showSubcategories ? "active" : ""
                      }`}
                    >
                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        <>
                          <div className="subcategory-grid">
                            {category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory.categoryId}
                                className="subcategory-button"
                                onClick={() =>
                                  handleSubcategoryClick(subcategory.categoryId)
                                }
                              >
                                <span className="subcategory-text">
                                  {subcategory.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="view-all-button"
                            onClick={() => {
                              navigate(`/categories/${category.categoryId}`);
                              onClose();
                            }}
                          >
                            Переглянути всі товари в категорії
                          </button>
                        </>
                      ) : (
                        <div className="empty-subcategory-container">
                          <div className="subcategory-empty">
                            <ExpandMore style={{ opacity: 0.7, marginBottom: '6px', fontSize: '1.5rem' }} />
                            <div>У цій категорії немає підкатегорій</div>
                          </div>
                          <button
                            className="view-all-button"
                            onClick={() => {
                              navigate(`/categories/${category.categoryId}`);
                              onClose();
                            }}
                          >
                            Переглянути всі товари в категорії
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {!categories.some((c) => c.showSubcategories) && (
                    <div className="empty-state">
                      <AutoAwesome className="empty-state-icon" />
                      <p className="empty-state-text">
                        Наведіть курсор на категорію, щоб переглянути доступні підкатегорії
                      </p>
                      <button
                        className="catalog-button"
                        onClick={() => {
                          navigate("/categories");
                          onClose();
                        }}
                      >
                        Перейти до повного каталогу
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryMenu; 