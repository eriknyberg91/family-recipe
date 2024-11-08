import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { recipeService, CreateRecipeData } from '../services/recipeService';

interface RecipeFormProps {
    onSuccess?: () => void;
  }

export function RecipeForm({onSuccess} : RecipeFormProps ) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [recipePhoto, setRecipePhoto] = useState<File | null>(null);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const recipeData: CreateRecipeData = {
        title,
        description,
        ingredients: ingredients.filter(i => i.trim() !== ''),
        instructions: instructions.filter(i => i.trim() !== ''),
        foodPhoto: foodPhoto || undefined,
        recipePhoto: recipePhoto || undefined,
      };

      await recipeService.createRecipe(recipeData, user.uid);
      
      // Reset form
      setTitle('');
      setDescription('');
      setIngredients(['']);
      setInstructions(['']);
      setFoodPhoto(null);
      setRecipePhoto(null);

      if (onSuccess) {
        onSuccess();
      }
      
      alert('Recipe created successfully!');
    } catch (err) {
      setError('Failed to create recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="input mt-1"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="mt-1 flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="input"
              placeholder="Enter ingredient"
            />
            {index === ingredients.length - 1 && (
              <button
                type="button"
                onClick={handleAddIngredient}
                className="btn btn-primary"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instructions</label>
        {instructions.map((instruction, index) => (
          <div key={index} className="mt-1 flex gap-2">
            <textarea
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              className="input"
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            {index === instructions.length - 1 && (
              <button
                type="button"
                onClick={handleAddInstruction}
                className="btn btn-primary"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Food Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoodPhoto(e.target.files?.[0] || null)}
          className="input mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Recipe Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setRecipePhoto(e.target.files?.[0] || null)}
          className="input mt-1"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Creating Recipe...' : 'Create Recipe'}
      </button>
    </form>
  );
}