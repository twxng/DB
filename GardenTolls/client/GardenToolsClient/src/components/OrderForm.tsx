import React, { useState } from 'react';
import { Order, OrderDetail, Product } from '../types';
import './OrderForm.css';

interface OrderFormProps {
  products: Product[];
  onSubmit: (order: Omit<Order, 'orderId'>) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ products, onSubmit }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingInfo, setShippingInfo] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: '',
    shippingPostalCode: '',
    paymentMethod: 'card',
    notes: ''
  });

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find(p => p.productId === selectedProduct);
      if (product) {
        const newDetail: OrderDetail = {
          orderDetailId: 0,
          orderId: 0,
          productId: product.productId,
          quantity: quantity,
          unitPrice: product.price,
          discount: 0,
          product: product
        };
        setOrderDetails([...orderDetails, newDetail]);
        setSelectedProduct(0);
        setQuantity(1);
      }
    }
  };

  const handleRemoveProduct = (index: number) => {
    setOrderDetails(orderDetails.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = orderDetails.reduce((sum, detail) => 
      sum + (detail.unitPrice * detail.quantity * (1 - detail.discount)), 0);

    const newOrder: Omit<Order, 'orderId'> = {
      customerId: 1, // TODO: Get from auth context
      orderDate: new Date().toISOString(),
      shippedDate: null,
      deliveryDate: null,
      status: 'pending',
      paymentMethod: shippingInfo.paymentMethod,
      paymentStatus: 'pending',
      totalAmount,
      shippingAddress: shippingInfo.shippingAddress,
      shippingCity: shippingInfo.shippingCity,
      shippingCountry: shippingInfo.shippingCountry,
      shippingPostalCode: shippingInfo.shippingPostalCode,
      notes: shippingInfo.notes,
      orderDetails
    };

    onSubmit(newOrder);
  };

  return (
    <div className="order-form-container">
      <h2>Оформлення замовлення</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <h3>Додати товари</h3>
          <div className="product-selection">
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
              className="form-select"
              aria-label="Виберіть товар"
            >
              <option value={0}>Виберіть товар</option>
              {products.map(product => (
                <option key={product.productId} value={product.productId}>
                  {product.name} - {product.price} грн
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-input"
              aria-label="Кількість товару"
              placeholder="Кількість"
            />
            <button 
              type="button" 
              onClick={handleAddProduct}
              className="btn btn-add"
            >
              Додати
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Товари в замовленні</h3>
          <div className="order-details">
            {orderDetails.map((detail, index) => (
              <div key={index} className="order-detail-item">
                <span>{detail.product?.name}</span>
                <span>{detail.quantity} шт.</span>
                <span>{detail.unitPrice} грн</span>
                <span>{(detail.unitPrice * detail.quantity).toFixed(2)} грн</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveProduct(index)}
                  className="btn btn-remove"
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Інформація про доставку</h3>
          <div className="shipping-info">
            <input
              type="text"
              placeholder="Адреса"
              value={shippingInfo.shippingAddress}
              onChange={(e) => setShippingInfo({...shippingInfo, shippingAddress: e.target.value})}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Місто"
              value={shippingInfo.shippingCity}
              onChange={(e) => setShippingInfo({...shippingInfo, shippingCity: e.target.value})}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Країна"
              value={shippingInfo.shippingCountry}
              onChange={(e) => setShippingInfo({...shippingInfo, shippingCountry: e.target.value})}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Поштовий індекс"
              value={shippingInfo.shippingPostalCode}
              onChange={(e) => setShippingInfo({...shippingInfo, shippingPostalCode: e.target.value})}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Спосіб оплати</h3>
          <select
            value={shippingInfo.paymentMethod}
            onChange={(e) => setShippingInfo({...shippingInfo, paymentMethod: e.target.value})}
            className="form-select"
            required
            aria-label="Спосіб оплати"
          >
            <option value="card">Банківська карта</option>
            <option value="cash">Готівка при отриманні</option>
          </select>
        </div>

        <div className="form-section">
          <h3>Примітки до замовлення</h3>
          <textarea
            value={shippingInfo.notes}
            onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
            className="form-textarea"
            placeholder="Додаткові побажання або коментарі..."
          />
        </div>

        <div className="form-section total-section">
          <h3>Загальна сума: {orderDetails.reduce((sum, detail) => 
            sum + (detail.unitPrice * detail.quantity * (1 - detail.discount)), 0).toFixed(2)} грн</h3>
        </div>

        <button type="submit" className="btn btn-submit">
          Оформити замовлення
        </button>
      </form>
    </div>
  );
}; 