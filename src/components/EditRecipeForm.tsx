import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Recipe, UpdateRecipeData, recipeService } from '../services/recipeService';

interface EditRecipeFormProps {
  recipe: Recipe;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditRecipeForm({ recipe, onSuccess, onCancel }: EditRecipeFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  // Initialize with at least one empty string if array is empty
  const [ingredients, setIngredients] = useState<string[]>(
    recipe.ingredients?.length ? recipe.ingredients : ['']
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe.instructions?.length ? recipe.instructions : ['']
  );
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [recipePhoto, setRecipePhoto] = useState<File | null>(null);
  const [removeFoodPhoto, setRemoveFoodPhoto] = useState(false);
  const [removeRecipePhoto, setRemoveRecipePhoto] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
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
      const recipeData: UpdateRecipeData = {
        title,
        description,
        ingredients: ingredients.filter(i => i.trim() !== ''),
        instructions: instructions.filter(i => i.trim() !== ''),
        foodPhoto: foodPhoto || undefined,
        recipePhoto: recipePhoto || undefined,
        removeFoodPhoto,
        removeRecipePhoto
      };

      await recipeService.updateRecipe(recipe.id, recipeData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to update recipe. Please try again.');
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="mt-1 flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="input flex-1"
              placeholder="Enter ingredient"
            />
            <button
              type="button"
              onClick={() => handleRemoveIngredient(index)}
              className="btn bg-red-500 hover:bg-red-600 text-white px-3"
            >
              -
            </button>
            {index === ingredients.length - 1 && (
              <button
                type="button"
                onClick={handleAddIngredient}
                className="btn btn-primary px-3"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
        {instructions.map((instruction, index) => (
          <div key={index} className="mt-1 flex gap-2">
            <textarea
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              className="input flex-1"
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            <button
              type="button"
              onClick={() => handleRemoveInstruction(index)}
              className="btn bg-red-500 hover:bg-red-600 text-white px-3"
            >
              -
            </button>
            {index === instructions.length - 1 && (
              <button
                type="button"
                onClick={handleAddInstruction}
                className="btn btn-primary px-3"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {recipe.foodPhotoUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Food Photo</label>
          <img src={recipe.foodPhotoUrl} alt="Food" className="w-32 h-32 object-cover mt-1" />
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={removeFoodPhoto}
                onChange={(e) => setRemoveFoodPhoto(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Remove food photo</span>
            </label>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">New Food Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoodPhoto(e.target.files?.[0] || null)}
          className="input mt-1"
        />
      </div>

      {recipe.recipePhotoUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Recipe Photo</label>
          <img src={recipe.recipePhotoUrl} alt="Recipe" className="w-32 h-32 object-cover mt-1" />
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={removeRecipePhoto}
                onChange={(e) => setRemoveRecipePhoto(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Remove recipe photo</span>
            </label>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">New Recipe Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setRecipePhoto(e.target.files?.[0] || null)}
          className="input mt-1"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Updating Recipe...' : 'Update Recipe'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-gray-200 hover:bg-gray-300 flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}