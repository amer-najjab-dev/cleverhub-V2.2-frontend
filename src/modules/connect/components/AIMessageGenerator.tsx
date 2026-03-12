import React, { useState } from 'react';
import { Sparkles, Copy, Check, Zap, Heart } from 'lucide-react';
import { connectService } from '../services/connect.service';
import { productsService } from '../../../services/products.service';

interface AIMessageGeneratorProps {
  onSelectMessage: (message: string) => void;
}

export const AIMessageGenerator: React.FC<AIMessageGeneratorProps> = ({
  onSelectMessage
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pointsCost, setPointsCost] = useState<number | undefined>(undefined);
  const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());

  const searchProducts = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await productsService.search(query);
      setSearchResults(response.slice(0, 5));
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const generateMessages = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const response = await connectService.generateAIMessages(
        selectedProduct.id,
        pointsCost
      );
      setGeneratedMessages(response.data);
    } catch (error) {
      console.error('Error generating messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const likeMessage = async (id: number) => {
    try {
      await connectService.likeAIMessage(id);
      setLikedMessages(prev => new Set([...prev, id]));
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold">Générateur IA de messages</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Produit à promouvoir
        </label>
        <div className="relative">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              searchProducts(e.target.value);
            }}
            placeholder="Rechercher un produit..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setProductSearch(product.name);
                    setSearchResults([]);
                  }}
                  className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.laboratory || ''}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prix en points (optionnel)
        </label>
        <input
          type="number"
          value={pointsCost || ''}
          onChange={(e) => setPointsCost(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Ex: 500"
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {selectedProduct && (
        <button
          onClick={generateMessages}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {loading ? 'Génération...' : 'Générer 3 messages IA'}
        </button>
      )}

      {generatedMessages.length > 0 && (
        <div className="space-y-4">
          {generatedMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                {msg.tone === 'professional' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Professionnel
                  </span>
                )}
                {msg.tone === 'friendly' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Amical
                  </span>
                )}
                {msg.tone === 'urgent' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    Urgent
                  </span>
                )}
              </div>

              <p className="text-gray-800 mb-3">{msg.message}</p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => likeMessage(msg.id)}
                  disabled={likedMessages.has(msg.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    likedMessages.has(msg.id)
                      ? 'text-pink-500'
                      : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyToClipboard(msg.message, msg.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onSelectMessage(msg.message)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Utiliser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};