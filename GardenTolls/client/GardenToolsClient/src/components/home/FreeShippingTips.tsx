import { LocalShipping } from '@mui/icons-material';
import './styles/FreeShippingTips.css';

const FreeShippingTips = () => {
	return(
		<div className="free-shipping-tips">
			<div className="free-shipping-tips-container">
				<LocalShipping className="free-shipping-tips-icon" />
				<span>Безкоштовна доставка для замовлень від 1000 грн на категорії дім і сад</span>
			</div>
		</div>
	)
};

export default FreeShippingTips;