import './styles/StoreAdvantages.css';
import { LocalShipping, Verified, Storefront, SupportAgent } from '@mui/icons-material';

const advantages = [
  {
    icon: <LocalShipping fontSize="inherit" />,
    title: 'Швидка доставка',
    description: 'Доставляємо замовлення по всій Україні протягом 1-3 днів'
  },
  {
    icon: <Verified fontSize="inherit" />,
    title: 'Гарантія якості',
    description: 'Всі товари проходять ретельну перевірку перед відправкою'
  },
  {
    icon: <Storefront fontSize="inherit" />,
    title: 'Великий вибір',
    description: 'Більше 10 000 товарів для саду та городу'
  },
  {
    icon: <SupportAgent fontSize="inherit" />,
    title: 'Підтримка 24/7',
    description: 'Наші консультанти завжди готові допомогти вам'
  }
];

const StoreAdvantages = () => {
  return (
    <section className="store-advantages">
      <h2 className="advantages-title">Переваги нашого магазину</h2>
      <div className="advantages-grid">
        {advantages.map((advantage, index) => (
          <div key={index} className="advantage-card">
            <div className="advantage-icon">{advantage.icon}</div>
            <h3 className="advantage-title">{advantage.title}</h3>
            <p className="advantage-description">{advantage.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StoreAdvantages; 