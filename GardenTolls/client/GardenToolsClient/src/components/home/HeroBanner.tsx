import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/HeroBanner.css';

// Додаємо контекст для відстеження стану меню категорій
import { useCategoryMenuContext } from '../../contexts/CategoryMenuContext';

// Масив банерів
const banners = [
  {
    title: 'Знайдіть ідеальні інструменти для вашого саду',
    description: 'Широкий вибір якісних садових інструментів за найкращими цінами',
    image: 'https://i.postimg.cc/brW9Rpqd/De-Watermark-ai-1746980003465.png',
    buttonText: 'Перейти до каталогу',
    buttonLink: '/products',
    align: 'left',
  },
  {
    title: 'Весняна колекція вже доступна',
    description: 'Знижки до 30% на нову колекцію садових інструментів',
    image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e',
    buttonText: 'Переглянути акції',
    buttonLink: '/promotions',
    align: 'right',
  },
  {
    title: 'Професійні засоби для догляду за рослинами',
    description: 'Добрива, захист від шкідників та інші товари для здоровя ваших рослин',
    image: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    buttonText: 'Дізнатися більше',
    buttonLink: '/categories/plant-care',
    align: 'center',
  },
];

const HeroBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // Отримуємо стан відкритості меню категорій
  const { isCategoryMenuOpen } = useCategoryMenuContext();

  // Автоматичне перемикання банерів
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = banners[currentBanner];

  // Стиль для фонового зображення
  const backgroundImageStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url(${banner.image})`,
  };

  return (
    <div className="hero-banner">
      {/* Фонове зображення */}
      <div className="hero-banner-image" style={backgroundImageStyle}>
        {!isCategoryMenuOpen && (
          <div className={`hero-banner-content ${banner.align === 'right' ? 'right' : banner.align === 'center' ? 'center' : ''}`}>
            <h1 className="hero-banner-title">{banner.title}</h1>
            <p className="hero-banner-description">{banner.description}</p>
            <Link to={banner.buttonLink} className="hero-banner-button">
              {banner.buttonText}
            </Link>
          </div>
        )}
      </div>

      {/* Індикатори слайдера */}
      {!isCategoryMenuOpen && (
        <div className="indicators">
          {banners.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`indicator ${index === currentBanner ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner; 