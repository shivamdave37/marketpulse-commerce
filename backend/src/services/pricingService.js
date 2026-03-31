export const AVAILABLE_COUPONS = {
  SAVE10: {
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    maxDiscount: 500
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    value: 0
  },
  WELCOME250: {
    code: 'WELCOME250',
    type: 'flat',
    value: 250,
    minSubtotal: 3000
  }
};

export function calculateOrderPricing(subtotal, couponCode = '') {
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const baseShippingFee = subtotal >= 999 ? 0 : 99;
  let shippingFee = baseShippingFee;
  let discountAmount = 0;
  let appliedCoupon = null;

  const coupon = AVAILABLE_COUPONS[normalizedCoupon];

  if (coupon) {
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      appliedCoupon = null;
    } else if (coupon.type === 'percent') {
      appliedCoupon = coupon.code;
      discountAmount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
    } else if (coupon.type === 'flat') {
      appliedCoupon = coupon.code;
      discountAmount = coupon.value;
    } else if (coupon.type === 'shipping') {
      appliedCoupon = coupon.code;
      shippingFee = 0;
    }
  }

  discountAmount = Math.min(discountAmount, subtotal);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    appliedCoupon
  };
}
