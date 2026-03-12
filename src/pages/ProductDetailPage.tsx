import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { productsService, Product } from '../services/products.service';
import { HeaderActions } from '../components/product/HeaderActions';
import { MainInfoContainer } from '../components/product/MainInfoContainer';
import { TechnicalGrid } from '../components/product/TechnicalGrid';
import { DescriptiveTabs } from '../components/product/DescriptiveTabs';
import { InventoryHistoryTable } from '../components/product/InventoryHistoryTable';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProduct(parseInt(id));
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      const response = await productsService.getById(productId);
      const productData = response;
      // Convertir precios de string a número
      if (productData.pricePPV) productData.pricePPV = Number(productData.pricePPV);
      if (productData.pricePPH) productData.pricePPH = Number(productData.pricePPH);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error al cargar el producto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    console.log('Editar producto', product?.id);
  };

  const handleDisable = async () => {
    if (!product) return;
    try {
      await productsService.update(product.id, { active: false });
      toast.success('Producto desactivado');
      fetchProduct(product.id);
    } catch (error) {
      toast.error('Error al desactivar producto');
    }
  };

  const handleAction = (action: string) => {
    console.log('Acción seleccionada:', action);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderActions onEdit={handleEdit} onDisable={handleDisable} onActionSelect={handleAction} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainInfoContainer
          name={product.name}
          pricePPV={product.pricePPV}
          pricePPH={product.pricePPH}
          category={product.category}
          zone={product.zone}
        />
        <TechnicalGrid
          barcode={product.barcode}
          dosageForm={product.dosageForm}
          laboratory={product.laboratory}
          prescription={product.prescription}
          sku={product.sku}
        />
        <DescriptiveTabs
          description={product.description}
          posologyAdult={product.posologyAdult}
          posologyChild={product.posologyChild}
          contraindications={product.contraindications}
          monograph={product.monograph}
        />
        <InventoryHistoryTable
          priceHistory={product.priceHistories}
          inventoryLots={product.inventoryLots}
          stockMovements={product.stockMovements}
          createdAt={typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toString()}
          updatedAt={typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt.toString()}
        />
      </main>
    </div>
  );
};