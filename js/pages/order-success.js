/**
 * Art Flair - Order Success Controller
 * Developed for Sabahz Trading
 */

const OrderSuccessPage = {
  init() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId') || 'AF-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const total = parseFloat(params.get('total')) || 4999.00;

    const orderIdEl = document.getElementById('order-id-display');
    const orderTotalEl = document.getElementById('order-total-display');
    const orderDateEl = document.getElementById('order-date-display');

    if (orderIdEl) orderIdEl.textContent = orderId;
    if (orderTotalEl) orderTotalEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (orderDateEl) orderDateEl.textContent = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
  }
};
