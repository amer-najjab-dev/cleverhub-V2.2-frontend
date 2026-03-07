import React from 'react';
// Eliminado Package que no se usaba
import { FavoriteCategory } from '../../services/loyalty.service';

interface FavoriteCategoriesProps {
  categories: FavoriteCategory[];
}

export const FavoriteCategories: React.FC<FavoriteCategoriesProps> = ({ categories }) => {
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="space-y-4">
      {categories.map((cat, index) => {
        const percentage = (cat.count / total) * 100;
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{cat.category}</span>
              <span className="text-gray-600">{cat.count} achats</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};