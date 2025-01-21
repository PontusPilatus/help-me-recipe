'use client';

import IngredientManager from '@/components/IngredientManager';
import PopularRecipes from '@/components/PopularRecipes';

export default function Home() {
  return (
    <>
      <div className="mb-8">
        <IngredientManager />
      </div>
      <PopularRecipes />
    </>
  );
}
