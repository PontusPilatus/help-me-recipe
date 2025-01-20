import IngredientManager from '@/components/IngredientManager';
import PopularRecipes from '@/components/PopularRecipes';
import ApiQuota from '@/components/ApiQuota';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <ApiQuota />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
          Help Me Recipe
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">
            What's in your kitchen?
          </h2>
          <IngredientManager />
        </div>

        <PopularRecipes />
      </div>
    </main>
  );
}
