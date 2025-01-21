'use client';

import { useRef, useEffect } from 'react';

interface Instruction {
  number: number;
  step: string;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary?: string;
  instructions?: Instruction[] | string;
}

interface RecipeModalProps {
  recipe: RecipeDetails;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Format instructions if they come as a string
  const formatInstructions = (instructions: string | Instruction[] | undefined): Instruction[] => {
    if (!instructions) {
      return [];
    }

    if (Array.isArray(instructions)) {
      return instructions;
    }

    // Remove HTML tags
    const cleanText = instructions.replace(/<[^>]*>/g, '');

    // Try to split by different step patterns
    let steps: string[] = [];

    if (cleanText.includes('Step')) {
      // Split by "Step X:" pattern
      steps = cleanText.split(/Step \d+:/).filter(Boolean);
    } else if (cleanText.match(/\d+\./)) {
      // Split by numbered steps (e.g., "1.", "2.")
      steps = cleanText.split(/\d+\./).filter(Boolean);
    } else if (cleanText.includes('. ')) {
      // Split by sentences if no clear step pattern
      steps = cleanText.split(/\. (?=[A-Z])/).filter(Boolean);
    } else {
      // Fallback: just use the whole text as one step
      steps = [cleanText];
    }

    return steps.map((step, index) => ({
      number: index + 1,
      step: step.trim().replace(/^\s*[.)\]}\-]+\s*/, '').trim() // Remove any leading punctuation
    }));
  };

  const instructions = formatInstructions(recipe.instructions);

  // Clean HTML from summary but preserve line breaks
  const cleanSummary = recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim() : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{recipe.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">⏱️</span>
              <span>{recipe.readyInMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">👥</span>
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {cleanSummary && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">About this Recipe</h3>
              <p className="text-gray-700 leading-relaxed">{cleanSummary}</p>
            </div>
          )}

          {instructions.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Instructions</h3>
                <ol className="space-y-4">
                  {instructions.map((instruction) => (
                    <li key={instruction.number} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        {instruction.number}
                      </span>
                      <p className="text-gray-700">{instruction.step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {recipe.sourceUrl && (
                <div className="pt-4 border-t">
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 flex items-center gap-2"
                  >
                    View Original Recipe
                    <span>↗️</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 