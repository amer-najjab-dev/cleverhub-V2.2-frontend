import { useRegion } from '../contexts/RegionContext';

/**
 * HOOK PERSONALIZADO - Para usar DENTRO de componentes React
 * 
 * Este hook debe usarse en componentes funcionales de React.
 * Proporciona funciones de formateo que se actualizan automáticamente
 * cuando cambia la región.
 * 
 * EJEMPLO DE USO:
 *   const { formatCurrency } = useCurrencyFormatter();
 *   return <div>{formatCurrency(100)}</div>;
 */
export const useCurrencyFormatter = () => {
  const { currentRegion } = useRegion();

  /**
   * Formato completo con símbolo de moneda
   * Ejemplos:
   *   - Marruecos: 100,00 MAD
   *   - Francia: 100,00 €
   *   - Túnez: 100,000 DT
   */
  const formatCurrency = (value: number): string => {
    const { currency, locale } = currentRegion;
    
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formatter.format(value);
    } catch (error) {
      // Fallback si el locale no es soportado
      console.warn(`Error formatting currency for locale ${locale}:`, error);
      return `${value.toFixed(2)} ${currency.symbol}`;
    }
  };

  /**
   * Formato simple (solo número + símbolo)
   * Útil para tablas donde el formato completo puede ser demasiado largo
   * 
   * Ejemplos:
   *   - Marruecos: 100,00 MAD
   *   - Francia: 100,00 €
   *   - Túnez: 100,000 DT
   */
  const formatSimple = (value: number): string => {
    const { currency } = currentRegion;
    const formatted = value.toFixed(2).replace('.', ',');
    
    return currency.position === 'before'
      ? `${currency.symbol}${formatted}`
      : `${formatted} ${currency.symbol}`;
  };

  /**
   * Formato para gráficos (solo número, sin símbolo)
   */
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(currentRegion.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return { formatCurrency, formatSimple, formatNumber };
};

/**
 * FUNCIONES ESTÁTICAS - Para usar FUERA de componentes React
 * 
 * Estas funciones no usan hooks, por lo que pueden ser llamadas
 * desde servicios, utilidades o código que no sea de React.
 * 
 * Requieren que se pase el código de región explícitamente.
 * 
 * EJEMPLO DE USO:
 *   formatCurrencyStatic(100, 'MA')  // "100,00 MAD"
 *   formatCurrencyStatic(100, 'FR')  // "100,00 €"
 */
export const formatCurrencyStatic = (value: number, regionCode: string = 'MA'): string => {
  // Configuración de monedas por región (copia de seguridad)
  const currencies: Record<string, { code: string; locale: string; symbol: string; position: 'before' | 'after' }> = {
    MA: { code: 'MAD', locale: 'fr-MA', symbol: 'MAD', position: 'after' },
    FR: { code: 'EUR', locale: 'fr-FR', symbol: '€', position: 'before' },
    ES: { code: 'EUR', locale: 'es-ES', symbol: '€', position: 'before' },
    TN: { code: 'TND', locale: 'fr-TN', symbol: 'DT', position: 'after' },
    DZ: { code: 'DZD', locale: 'fr-DZ', symbol: 'DA', position: 'after' }
  };

  const cfg = currencies[regionCode] || currencies.MA;
  
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: 2
    }).format(value);
  } catch (error) {
    // Fallback simple
    return `${value.toFixed(2)} ${cfg.symbol}`;
  }
};

/**
 * Formato simple estático
 */
export const formatSimpleStatic = (value: number, regionCode: string = 'MA'): string => {
  const currencies: Record<string, { symbol: string; position: 'before' | 'after' }> = {
    MA: { symbol: 'MAD', position: 'after' },
    FR: { symbol: '€', position: 'before' },
    ES: { symbol: '€', position: 'before' },
    TN: { symbol: 'DT', position: 'after' },
    DZ: { symbol: 'DA', position: 'after' }
  };

  const cfg = currencies[regionCode] || currencies.MA;
  const formatted = value.toFixed(2).replace('.', ',');
  
  return cfg.position === 'before'
    ? `${cfg.symbol}${formatted}`
    : `${formatted} ${cfg.symbol}`;
};