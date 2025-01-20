'use client';

interface RecipeDetails {
  title: string;
  image: string;
  summary: string;
  instructions: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

interface RecipeModalProps {
  recipe: RecipeDetails | null;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  if (!recipe) return null;

  // Format the summary to be more readable
  const formatSummary = (html: string) => {
    // Remove HTML tags but keep important information
    let text = html
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract and format key information
    const info = {
      servings: text.match(/serves (\d+)/i)?.[1],
      calories: text.match(/(\d+) calories/i)?.[1],
      protein: text.match(/(\d+)g of protein/i)?.[1],
      fat: text.match(/(\d+)g of fat/i)?.[1],
      prepTime: text.match(/takes (?:roughly |approximately )?(\d+) minutes/i)?.[1],
    };

    // Create a more readable format
    let formattedSummary = [];

    // Add key nutritional information
    let nutritionInfo = [];
    if (info.calories) nutritionInfo.push(`${info.calories} calories`);
    if (info.protein) nutritionInfo.push(`${info.protein}g protein`);
    if (info.fat) nutritionInfo.push(`${info.fat}g fat`);

    if (nutritionInfo.length > 0) {
      formattedSummary.push(`Nutritional Information (per serving):\n${nutritionInfo.join(' • ')}`);
    }

    // Add preparation time if available
    if (info.prepTime) {
      formattedSummary.push(`Preparation Time: ${info.prepTime} minutes`);
    }

    // Add dietary information
    const dietaryInfo = [];
    if (text.toLowerCase().includes('gluten free')) dietaryInfo.push('Gluten-Free');
    if (text.toLowerCase().includes('dairy free')) dietaryInfo.push('Dairy-Free');
    if (text.toLowerCase().includes('vegan')) dietaryInfo.push('Vegan');
    if (text.toLowerCase().includes('vegetarian')) dietaryInfo.push('Vegetarian');

    if (dietaryInfo.length > 0) {
      formattedSummary.push(`Dietary Information: ${dietaryInfo.join(' • ')}`);
    }

    // Add a general description
    const description = text
      .replace(/\d+ person found this recipe.*$/, '') // Remove rating information
      .replace(/From preparation to the plate.*$/, '') // Remove time information
      .replace(/Taking all factors into account.*$/, '') // Remove score information
      .replace(/It is brought to you by.*$/, '') // Remove source information
      .replace(/Similar recipes.*$/, '') // Remove similar recipes
      .trim();

    formattedSummary.push(description);

    return formattedSummary.join('\n\n');
  };

  // Parse and format instructions
  const formatInstructions = (instructions: string) => {
    if (!instructions) return [];

    // Extract steps from HTML list if present
    const listMatch = instructions.match(/<ol>(.*?)<\/ol>/s);
    if (listMatch) {
      return listMatch[1]
        .split('</li>')
        .map(step => step
          .replace(/<li>/g, '')
          .replace(/<[^>]+>/g, '')
          .trim()
        )
        .filter(step => step.length > 0);
    }

    // Fallback to regular text splitting
    return instructions
      .replace(/<[^>]+>/g, '')
      .split(/(?:\d+\.|\d+\)|\bStep \d+:)/g)
      .map(step => step.trim())
      .filter(step => step.length > 0);
  };

  const steps = formatInstructions(recipe.instructions);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-900">{recipe.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Image and Quick Info */}
          <div className="mb-8">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span className="flex items-center text-gray-700">
                <span className="text-xl mr-2">🕒</span>
                <span>
                  <strong>{recipe.readyInMinutes}</strong> minutes
                </span>
              </span>
              <span className="flex items-center text-gray-700">
                <span className="text-xl mr-2">👥</span>
                <span>
                  <strong>{recipe.servings}</strong> servings
                </span>
              </span>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">About this Recipe</h3>
            <div className="space-y-4 text-gray-700">
              {formatSummary(recipe.summary).split('\n\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Instructions</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Source Link */}
          {recipe.sourceUrl && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 hover:text-green-700"
              >
                View Original Recipe
                <span className="ml-2">→</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 