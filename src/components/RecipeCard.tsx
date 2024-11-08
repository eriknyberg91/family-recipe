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
          // Call onDelete after successful deletion
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {recipe.foodPhotoUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={recipe.foodPhotoUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Ingredients:</h4>
          <ul className="list-disc list-inside text-gray-600">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside text-gray-600">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        {recipe.recipePhotoUrl && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Recipe Photo:</h4>
            <img
              src={recipe.recipePhotoUrl}
              alt="Recipe"
              className="w-full rounded-lg"
            />
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          Added: {recipe.createdAt.toLocaleDateString()}
        </div>
        <div className="p-4 border-t">
       {/* { <button
          onClick={() => setIsEditing(true)}
          className="btn btn-primary w-full"
        >
          Edit Recipe
        </button>} */}
      </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}