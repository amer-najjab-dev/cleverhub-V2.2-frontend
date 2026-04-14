import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Wallet, TrendingUp, DollarSign, Percent, Tag, AlertCircle, Star } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { salesService } from '../../services/sales.service';
import { useCurrencyFormatter } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'mixto' | 'credito' | 'puntos';

export const FinancialSummary = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('');
  const [discountTypeInput, setDiscountTypeInput] = useState<'percentage' | 'amount'>('percentage');
  const [isProcessing, setIsProcessing] = useState(false);
  const [region, setRegion] = useState(() => {
    return localStorage.getItem('cleverhub_region') || 'MA';
  });
  
  const { formatCurrency } = useCurrencyFormatter();
  
  // Escuchar cambios en la región
  useEffect(() => {
    const handleRegionChange = (event: CustomEvent) => {
      setRegion(event.detail);
    };
    window.addEventListener('regionChange', handleRegionChange as EventListener);
    
    const handleStorage = () => {
      setRegion(localStorage.getItem('cleverhub_region') || 'MA');
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('regionChange', handleRegionChange as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  
  const {
    getSubtotal,
    getSubtotalWithProductDiscounts,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    discountType,
    discountValue,
    paymentMethod,
    setPaymentMethod,
    mixedPayments,
    setMixedPayment,
    clearMixedPayment,
    updateCartDiscount,
    hasProductDiscounts,
    items,
    clientId,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const subtotalWithProductDiscounts = getSubtotalWithProductDiscounts();
  const discountAmount = getDiscountAmount();
  const taxAmount = getTaxAmount(region);
  const total = getTotal(region);
  const changeAmount = paidAmount ? parseFloat(paidAmount) - total : 0;
  
  const hasProductLevelDiscounts = hasProductDiscounts();
  const productDiscountsAmount = subtotal - subtotalWithProductDiscounts;

  // ============ FUNCIONES DE VALIDACIÓN ============
  const canCompleteSale = (): boolean => {
    if (items.length === 0) return false;
    if (!paymentMethod) return false;
    
    switch (paymentMethod) {
      case 'credito':
      case 'puntos':
        return !!clientId;
          
      case 'tarjeta':
      case 'transferencia':
      case 'cheque':
        return true;
          
      case 'efectivo':
        return parseFloat(paidAmount || '0') >= total;
          
      case 'mixto':
        if (!mixedPayments || mixedPayments.step !== 'completed') {
          return false;
        }
        const firstAmount = mixedPayments.firstAmount || 0;
        const secondAmount = mixedPayments.secondAmount || 0;
        if (firstAmount <= 0 || secondAmount <= 0) {
          return false;
        }
        const sum = firstAmount + secondAmount;
        return Math.abs(sum - total) < 0.01;
          
      default:
        return false;
    }
  };

  const showAmountField = (): boolean => {
    if (!paymentMethod) return false;
    if (['tarjeta', 'transferencia', 'cheque', 'credito', 'puntos'].includes(paymentMethod)) {
      return false;
    }
    if (paymentMethod === 'efectivo') {
      return true;
    }
    return false;
  };
  
  const getMinAmount = (): number => {
    if (paymentMethod === 'efectivo') {
      return total;
    }
    if (paymentMethod === 'mixto') {
      return 0.01;
    }
    return 0;
  };
  
  const getPaidAmountToSend = (): number => {
    if (!paymentMethod) return 0;
    
    if (['tarjeta', 'transferencia', 'cheque'].includes(paymentMethod)) {
      return total;
    }
    
    if (paymentMethod === 'credito' || paymentMethod === 'puntos') {
      return total;
    }
    
    if (paymentMethod === 'efectivo') {
      return parseFloat(paidAmount || '0');
    }
    
    if (paymentMethod === 'mixto' && mixedPayments && mixedPayments.step === 'completed') {
      return (mixedPayments.firstAmount || 0) + (mixedPayments.secondAmount || 0);
    }
    
    return 0;
  };
  
  // ============ FUNCIÓN MEJORADA PARA TEXTO DEL BOTÓN ============
  const getButtonText = (): string => {
    if (isProcessing) return t('financialSummary.processing');
    if (items.length === 0) return t('financialSummary.empty_cart');
    
    if (paymentMethod === 'credito' && !clientId) {
      return t('financialSummary.select_client_credit');
    }
    
    if (paymentMethod === 'puntos' && !clientId) {
      return t('financialSummary.select_client_points');
    }
    
    if (!canCompleteSale()) {
      if (paymentMethod === 'efectivo' && parseFloat(paidAmount || '0') < total) {
        const falta = total - parseFloat(paidAmount || '0');
        return t('financialSummary.insufficient_amount', { amount: formatCurrency(falta) });
      }
        
      if (paymentMethod === 'mixto') {
        if (!mixedPayments || mixedPayments.step !== 'completed') {
          return t('financialSummary.select_two_methods');
        }
        const firstAmount = mixedPayments.firstAmount || 0;
        const secondAmount = mixedPayments.secondAmount || 0;
        const sum = firstAmount + secondAmount;
        if (Math.abs(sum - total) >= 0.01) {
          return t('financialSummary.sum_mismatch', { sum: formatCurrency(sum), total: formatCurrency(total) });
        }
      }
        
      return t('financialSummary.incomplete_payment');
    }
    
    return t('financialSummary.finalize', { total: formatCurrency(total) });
  };

  const handleApplyDiscount = () => {
    if (discountInput && !hasProductLevelDiscounts) {
      const value = parseFloat(discountInput);
      if (!isNaN(value) && value > 0) {
        updateCartDiscount(discountTypeInput, value);
        setDiscountInput('');
      }
    }
  };

  const handleRemoveDiscount = () => {
    updateCartDiscount('none', 0);
  };

  const getBackendPaymentMethod = (method: PaymentMethod): 'cash' | 'Credit Card' | 'credit' | 'Bank Transfer' | 'Bank Cheque' | 'mixed' => {
    switch (method) {
      case 'efectivo': return 'cash';
      case 'tarjeta': return 'Credit Card';
      case 'credito': return 'credit';
      case 'puntos': return 'credit';
      case 'transferencia': return 'Bank Transfer';
      case 'cheque': return 'Bank Cheque';
      case 'mixto': return 'mixed';
      default: return 'cash';
    }
  };

  const getBackendDiscountType = (type: string): 'percentage' | 'fixed' | 'product' | 'cart' | 'none' | undefined => {
    if (type === 'none') return undefined;
    if (type === 'percentage') return 'percentage';
    if (type === 'amount') return 'fixed';
    return undefined;
  };

  const getPaymentStatus = (): 'paid' | 'partial' | 'pending' => {
    const amountPaid = getPaidAmountToSend();
    
    if (amountPaid >= total) {
      return 'paid';
    } else if (amountPaid > 0 && amountPaid < total) {
      return 'partial';
    } else {
      return 'pending';
    }
  };

  const handleMixedPaymentMethodClick = (methodId: string) => {
    if (!mixedPayments) return;

    const method = methodId as 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'cheque';

    if (mixedPayments.firstMethod === method || mixedPayments.secondMethod === method) {
      return;
    }

    if (mixedPayments.step === 'selecting_first') {
      setMixedPayment({
        firstMethod: method,
        step: 'selecting_second'
      });
    }
    else if (mixedPayments.step === 'selecting_second') {
      const firstAmount = mixedPayments.firstAmount || 0;
      const secondAmount = total - firstAmount;
      
      setMixedPayment({
        secondMethod: method,
        secondAmount: secondAmount,
        step: 'completed'
      });
    }
  };

  const handleFirstAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setMixedPayment({ firstAmount: undefined });
    } else {
      setMixedPayment({ firstAmount: numValue });
      
      if (mixedPayments?.secondMethod) {
        const secondAmount = Math.max(0, total - numValue);
        setMixedPayment({ secondAmount });
      }
    }
  };

  const resetMixedPayment = () => {
    clearMixedPayment();
    setMixedPayment({ step: 'selecting_first' });
  };

  const exitMixedPayment = () => {
    clearMixedPayment();
  };

  const handlePaymentMethodClick = (methodId: string, isDisabled: boolean) => {
    if (isDisabled) return;

    if (methodId === 'mixto') {
      setPaymentMethod('mixto');
      if (!mixedPayments) {
        setMixedPayment({ step: 'selecting_first' });
      }
      return;
    }
    
    if (methodId === 'puntos') {
      setPaymentMethod('puntos');
      return;
    }

    if (paymentMethod === 'mixto' && mixedPayments) {
      handleMixedPaymentMethodClick(methodId);
    } else {
      setPaymentMethod(methodId as any);
      if (methodId !== 'efectivo') {
        setPaidAmount('');
      }
    }
  };

  const handleFinalize = async () => {
    if (isProcessing) return;
    
    if (items.length === 0) {
      alert(t('financialSummary.no_products'));
      return;
    }

    if (!user?.id) {
      alert(t('financialSummary.no_user'));
      return;
    }

    setIsProcessing(true);
    
    try {
      const total = getTotal(region);
      const paymentStatus = getPaymentStatus();
      
      let payments = [];
      if (paymentMethod === 'mixto' && mixedPayments && mixedPayments.step === 'completed') {
        payments = [
          { method: getBackendPaymentMethod(mixedPayments.firstMethod!), amount: mixedPayments.firstAmount! },
          { method: getBackendPaymentMethod(mixedPayments.secondMethod!), amount: mixedPayments.secondAmount! }
        ];
      } else {
        payments = [{ 
          method: paymentMethod ? getBackendPaymentMethod(paymentMethod) : 'cash', 
          amount: getPaidAmountToSend() 
        }];
      }

      const saleData = {
        userId: user.id,
        clientId: clientId || undefined,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unit_price_ppv: item.pricePPV,
          unit_price_pph: item.pricePPH,
          discountPercentage: item.discountPercentage || 0,
          discountAmount: (item.pricePPV * item.quantity * (item.discountPercentage || 0)) / 100
        })),
        discountType: getBackendDiscountType(discountType),
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        discountPercentage: discountType === 'percentage' ? discountValue : undefined,
        paymentMethod: paymentMethod ? getBackendPaymentMethod(paymentMethod) : 'cash',
        paidAmount: getPaidAmountToSend(),
        payments: payments,
        paymentStatus: paymentStatus,
        total,
        notes: 'Venta desde CleverHub POS',
        adultFlag: true,
        pregnantFlag: false,
        lactatingFlag: false,
        chronicConditionFlag: false,
        usualMedicationFlag: false
      };
      
      console.log('Enviando venta al backend:', JSON.stringify(saleData, null, 2));
      
      const response = await salesService.create(saleData);
      
      console.log('Venta creada exitosamente:', response.data);
      
      clearCart();
      setPaidAmount('');
      
      const result = response.data || response;
      const saleNumber = result.saleNumber || result.id || 'N/A';
      alert(t('financialSummary.sale_completed', { saleNumber, total: formatCurrency(total) }));
      
      setTimeout(() => {
        window.location.href = '/sales';
      }, 1500);
      
    } catch (error: any) {
      console.error('Error finalizando venta:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          t('financialSummary.sale_error');
      alert(`${t('financialSummary.sale_error_prefix')}: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'efectivo', label: t('financialSummary.cash'), icon: Wallet },
    { id: 'tarjeta', label: t('financialSummary.card'), icon: CreditCard },
    { id: 'transferencia', label: t('financialSummary.transfer'), icon: TrendingUp },
    { id: 'credito', label: t('financialSummary.credit'), icon: CreditCard },
    { id: 'cheque', label: t('financialSummary.check'), icon: DollarSign },
    { id: 'mixto', label: t('financialSummary.mixed'), icon: Wallet },
    { id: 'puntos', label: t('financialSummary.points'), icon: Star },
  ];

  const renderMixedPaymentUI = () => {
    if (paymentMethod !== 'mixto' || !mixedPayments) return null;

    const { step, firstMethod, firstAmount, secondMethod, secondAmount } = mixedPayments;
    const totalPaid = (firstAmount || 0) + (secondAmount || 0);

    return (
      <div className="mb-4 border border-gray-300 rounded-lg p-3 bg-blue-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('financialSummary.mixed_payment')}</h4>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-600">
            {step === 'selecting_first' ? t('financialSummary.step1') :
                   step === 'selecting_second' ? t('financialSummary.step2') :
                   t('financialSummary.step3')}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetMixedPayment}
              className="text-xs text-red-600 hover:text-red-800"
            >
              {t('common.reset')}
            </button>
            <button
              onClick={exitMixedPayment}
              className="text-xs text-gray-600 hover:text-gray-800"
              title={t('financialSummary.exit_mixed')}
            >
              ✕
            </button>
          </div>
        </div>

        {firstMethod && (
          <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">{t('financialSummary.first_method')} {firstMethod}</span>
              {step === 'selecting_second' && (
                <span className="text-xs text-green-600">✔ {t('financialSummary.selected')}</span>
              )}
            </div>
            
            {step === 'selecting_second' && (
              <div className="mt-2">
                <label className="text-xs text-gray-600 block mb-1">
                  {t('financialSummary.enter_amount_for')} {firstMethod}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={firstAmount || ''}
                    onChange={(e) => handleFirstAmountChange(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    max={total}
                    step="0.01"
                    className="w-full px-3 py-1.5 pl-7 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">{formatCurrency(0).split(' ')[1] || 'MAD'}</span>
                </div>
                {firstAmount && firstAmount > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {t('financialSummary.remaining')}: {formatCurrency(total - firstAmount)}
                  </div>
                )}
              </div>
            )}
            
            {step === 'completed' && firstAmount && (
              <div className="text-xs text-green-600 mt-1">
                {t('financialSummary.amount')}: {formatCurrency(firstAmount)}
              </div>
            )}
          </div>
        )}

        {secondMethod && (
          <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">{t('financialSummary.second_method')} {secondMethod}</span>
              {step === 'completed' && (
                <span className="text-xs text-green-600">✔ {t('financialSummary.auto_completed')}</span>
              )}
            </div>
            
            {step === 'completed' && secondAmount && (
              <div className="text-xs text-green-600 mt-1">
                {t('financialSummary.amount')}: {formatCurrency(secondAmount)} ({t('financialSummary.auto_calculated')})
              </div>
            )}
          </div>
        )}

        {step === 'completed' && (
          <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{t('financialSummary.total_paid')}:</span>
              <span className="font-bold">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('financialSummary.total_sale')}:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className={`flex justify-between text-sm ${Math.abs(totalPaid - total) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
              <span>{t('financialSummary.difference')}:</span>
              <span className="font-bold">{formatCurrency(totalPaid - total)}</span>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-600">
          {step === 'selecting_first' && t('financialSummary.select_first_method')}
          {step === 'selecting_second' && t('financialSummary.select_second_method')}
          {step === 'completed' && t('financialSummary.mixed_configured')}
        </div>
      </div>
    );
  };

  const getButtonStyle = (methodId: string) => {
    const Icon = paymentMethods.find(m => m.id === methodId)?.icon || Wallet;
    const isDisabled = (methodId === 'credito' && !clientId) || (methodId === 'puntos' && !clientId);
    
    if (paymentMethod === methodId && methodId !== 'mixto') {
      return {
        style: 'border-blue-500 bg-blue-50 text-blue-700',
        icon: Icon,
        disabled: isDisabled
      };
    }
    
    if (isDisabled) {
      return {
        style: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed',
        icon: Icon,
        disabled: true
      };
    }
    
    if (methodId === 'mixto') {
      return {
        style: paymentMethod === 'mixto' 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50',
        icon: Icon,
        disabled: false
      };
    }
    
    if (paymentMethod === 'mixto' && mixedPayments) {
      const isFirstSelected = mixedPayments.firstMethod === methodId;
      const isSecondSelected = mixedPayments.secondMethod === methodId;
      
      if (isFirstSelected || isSecondSelected) {
        return {
          style: 'border-green-500 bg-green-50 text-green-700',
          icon: Icon,
          disabled: false
        };
      }
      
      if (mixedPayments.step === 'selecting_first') {
        return {
          style: 'border-red-300 bg-red-50 text-gray-700 hover:border-red-400',
          icon: Icon,
          disabled: false
        };
      }
      
      if (mixedPayments.step === 'selecting_second' && mixedPayments.firstMethod !== methodId) {
        return {
          style: 'border-red-300 bg-red-50 text-gray-700 hover:border-red-400',
          icon: Icon,
          disabled: false
        };
      }
    }
    
    return {
      style: 'border-gray-300 hover:border-blue-300 hover:bg-blue-50',
      icon: Icon,
      disabled: false
    };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-fit">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{t('financialSummary.title')}</h3>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('financialSummary.payment_method')}</h4>
        <div className="flex flex-wrap gap-1.5">
          {paymentMethods.map((method) => {
            const { style, icon: Icon, disabled } = getButtonStyle(method.id);
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodClick(method.id, disabled)}
                className={`flex items-center px-2.5 py-1.5 rounded-lg border transition-colors text-xs ${style}`}
                disabled={disabled}
                title={disabled ? t('financialSummary.select_client_hint') : ''}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {method.label}
                {disabled && <span className="ml-1 text-xs">(✗)</span>}
              </button>
            );
          })}
        </div>
        
        {(paymentMethod === 'credito' || paymentMethod === 'puntos') && !clientId && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            ⚠️ {paymentMethod === 'credito' ? t('financialSummary.credit_client_required') : t('financialSummary.points_client_required')}
          </div>
        )}
      </div>

      {renderMixedPaymentUI()}

      <div className={`mb-4 border rounded-lg p-3 ${hasProductLevelDiscounts ? 'bg-gray-100 border-gray-300' : 'bg-amber-50 border-amber-200'}`}>
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          {t('financialSummary.cart_discount')}
          {hasProductLevelDiscounts && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {t('financialSummary.not_available')}
            </span>
          )}
        </h4>
        
        {hasProductLevelDiscounts ? (
          <div className="flex items-center text-amber-700 text-sm">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-xs">{t('financialSummary.product_discounts_active')}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <button
                onClick={() => setDiscountTypeInput('percentage')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs ${
                  discountTypeInput === 'percentage'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Percent className="w-3.5 h-3.5 inline mr-1" />
                {t('financialSummary.percentage')}
              </button>
              <button
                onClick={() => setDiscountTypeInput('amount')}
                className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs ${
                  discountTypeInput === 'amount'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                {t('financialSummary.fixed_amount')}
              </button>
            </div>
            
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder={discountTypeInput === 'percentage' ? '10' : '5.00'}
                  min="0"
                  step={discountTypeInput === 'percentage' ? '1' : '0.01'}
                  className="w-full px-3 py-1.5 pl-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={hasProductLevelDiscounts}
                />
                <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">
                  {discountTypeInput === 'percentage' ? '%' : formatCurrency(0).split(' ')[1] || 'MAD'}
                </span>
              </div>
              <button
                onClick={handleApplyDiscount}
                disabled={hasProductLevelDiscounts}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap ${
                  hasProductLevelDiscounts
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {t('common.apply')}
              </button>
            </div>

            {discountAmount > 0 && !hasProductLevelDiscounts && (
              <div className="flex items-center justify-between pt-1.5 border-t border-amber-200">
                <span className="text-xs text-gray-600">
                  {t('financialSummary.discount_applied')}: {discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)}
                </span>
                <button
                  onClick={handleRemoveDiscount}
                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                >
                  {t('common.remove')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Totales */}
      <div className="mb-4 border border-gray-200 rounded-lg p-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">{t('financialSummary.subtotal_ppv')}</span>
            <span className="font-medium text-sm">{formatCurrency(subtotal)}</span>
          </div>
          
          {productDiscountsAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">{t('financialSummary.product_discounts')}</span>
              <span className="font-medium text-sm text-green-600">-{formatCurrency(productDiscountsAmount)}</span>
            </div>
          )}
          
          {discountAmount > 0 && productDiscountsAmount === 0 && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">{t('financialSummary.cart_discount_label')}</span>
              <span className="font-medium text-sm text-red-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          {/* IVA - Solo visible para países que no son Marruecos */}
          {region !== 'MA' && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">
                {t('financialSummary.vat')} ({region === 'FR' ? '20' : region === 'ES' ? '21' : '19'}%)
              </span>
              <span className="font-medium text-sm">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold text-md text-gray-900">{t('financialSummary.total_to_pay')}</span>
            <span className="font-bold text-lg text-blue-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {showAmountField() && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1.5">
            {t('financialSummary.payment_received')}
            {paymentMethod === 'efectivo' && ` (${t('financialSummary.minimum')}: ${formatCurrency(total)})`}
          </h4>
          <div className="relative">
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={paymentMethod === 'efectivo' ? total.toFixed(2) : '0.00'}
              min={getMinAmount()}
              step="0.01"
              className="w-full px-3 py-1.5 pl-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">{formatCurrency(0).split(' ')[1] || 'MAD'}</span>
          </div>
        </div>
      )}

      {changeAmount > 0 && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-green-800 font-medium text-sm">{t('financialSummary.change_to_return')}</span>
            <span className="text-green-800 font-bold text-md">{formatCurrency(changeAmount)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleFinalize}
        disabled={!canCompleteSale() || isProcessing}
        className={`w-full py-2.5 rounded-lg font-semibold transition-colors text-sm ${
          canCompleteSale() && !isProcessing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('financialSummary.processing')}
          </span>
        ) : (
          getButtonText()
        )}
      </button>
    </div>
  );
};
