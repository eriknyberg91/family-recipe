import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RecipeForm } from '../components/RecipeForm';
import { RecipeCard } from '../components/RecipeCard';
import { recipeService, Recipe } from '../services/recipeService';

export function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRecipes = await recipeService.getRecipes();
      setRecipes(fetchedRecipes);
      setError('');
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRecipeUpdate = async () => {
    await loadRecipes();
  };

  const handleRecipeDelete = async () => {
    await loadRecipes();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Family Recipe Collection</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.email}</span>
            <button 
              onClick={handleSignOut}
              className="btn btn-primary"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Add Recipe Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Hide Form' : 'Add New Recipe'}
          </button>
        </div>
        
        {/* Add Recipe Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Add New Recipe</h2>
            <RecipeForm onSuccess={() => {
              setShowAddForm(false);
              handleRecipeUpdate();
            }} />
          </div>
        )}

        {/* Recipe List */}
        {loading ? (
          <div className="text-center py-8">Loading recipes...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No recipes yet. Add your first recipe!
          </div>
        ) : (
          <div className="grid gap-8">
            {recipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe}
                onUpdate={handleRecipeUpdate}
                onDelete={handleRecipeDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}