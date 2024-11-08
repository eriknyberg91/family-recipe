import { useState } from 'react';
import { Recipe, recipeService } from '../services/recipeService';
import { EditRecipeForm } from './EditRecipeForm';
import { ConfirmDialog } from './ConfirmDialog';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdate: () => void;
  onDelete: () => void;
}

export function RecipeCard({ recipe, onUpdate, onDelete }: RecipeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await recipeService.deleteRecipe(recipe.id);
      setIsDeleteDialogOpen(false);
      onDelete();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Edit Recipe</h2>
        <EditRecipeForm 
          recipe={recipe}
          onSuccess={() => {
            setIsEditing(false);
            onUpdate();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-4">{recipe.title}</h3>

          {/* Food Photo */}
            {recipe.foodPhotoUrl && (
              <div className="mb-4">
                <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={recipe.foodPhotoUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover" // Changed from object-contain to object-cover
                  />
                </div>
              </div>
            )}

          {/* Description */}
          <p className="text-gray-600 mb-6">{recipe.description}</p>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside text-gray-600">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside text-gray-600">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="mb-2">{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Recipe Photo */}
          {recipe.recipePhotoUrl && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Recipe Photo:</h4>
              <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={recipe.recipePhotoUrl}
                  alt="Recipe"
                  className="w-full h-full object-cover" // Changed from object-contain to object-cover
                />
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="mt-4 text-sm text-gray-500">
            Added: {recipe.createdAt.toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t flex gap-4">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary flex-1"
          >
            Edit Recipe
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete Recipe'}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}