import { db, storage } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  foodPhotoUrl?: string;
  recipePhotoUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  foodPhoto?: File;
  recipePhoto?: File;
}

export interface UpdateRecipeData {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    foodPhoto?: File;
    recipePhoto?: File;
    // Add flags to track if we should remove existing photos
    removeFoodPhoto?: boolean;
    removeRecipePhoto?: boolean;
  }

export const recipeService = {
  async getRecipes(): Promise<Recipe[]> {
    try {
      const recipesQuery = query(
        collection(db, 'recipes'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(recipesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamps to Dates
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Recipe[];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  async createRecipe(data: CreateRecipeData, userId: string) {
    try {
      let foodPhotoUrl = '';
      let recipePhotoUrl = '';

      // Upload food photo if provided
      if (data.foodPhoto) {
        console.log('Starting food photo upload...');
        const foodPhotoRef = ref(storage, `recipes/${Date.now()}_food_${data.foodPhoto.name}`);
        console.log('Food photo reference created:', foodPhotoRef.fullPath);
        
        try {
          const foodSnapshot = await uploadBytes(foodPhotoRef, data.foodPhoto);
          console.log('Food photo uploaded successfully:', foodSnapshot);
          foodPhotoUrl = await getDownloadURL(foodPhotoRef);
          console.log('Food photo URL obtained:', foodPhotoUrl);
        } catch (error) {
          console.error('Error uploading food photo:', error);
          throw error;
        }
      }

      // Upload recipe photo if provided
      if (data.recipePhoto) {
        console.log('Starting recipe photo upload...');
        const recipePhotoRef = ref(storage, `recipes/${Date.now()}_recipe_${data.recipePhoto.name}`);
        console.log('Recipe photo reference created:', recipePhotoRef.fullPath);
        
        try {
          const recipeSnapshot = await uploadBytes(recipePhotoRef, data.recipePhoto);
          console.log('Recipe photo uploaded successfully:', recipeSnapshot);
          recipePhotoUrl = await getDownloadURL(recipePhotoRef);
          console.log('Recipe photo URL obtained:', recipePhotoUrl);
        } catch (error) {
          console.error('Error uploading recipe photo:', error);
          throw error;
        }
      }

      // Create recipe document
      const recipeData = {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        foodPhotoUrl,
        recipePhotoUrl,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Creating recipe document with data:', recipeData);
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('Recipe document created successfully:', docRef.id);

      return { id: docRef.id, ...recipeData };
    } catch (error) {
      console.error('Error in createRecipe:', error);
      throw error;
    }
  },

  async updateRecipe(recipeId: string, data: UpdateRecipeData) {
    try {
      let foodPhotoUrl;
      let recipePhotoUrl;

      // Handle food photo
      if (data.foodPhoto) {
        const foodPhotoRef = ref(storage, `recipes/${Date.now()}_food_${data.foodPhoto.name}`);
        await uploadBytes(foodPhotoRef, data.foodPhoto);
        foodPhotoUrl = await getDownloadURL(foodPhotoRef);
      }

      // Handle recipe photo
      if (data.recipePhoto) {
        const recipePhotoRef = ref(storage, `recipes/${Date.now()}_recipe_${data.recipePhoto.name}`);
        await uploadBytes(recipePhotoRef, data.recipePhoto);
        recipePhotoUrl = await getDownloadURL(recipePhotoRef);
      }

      const recipeRef = doc(db, 'recipes', recipeId);
      const updateData: any = {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        updatedAt: serverTimestamp(),
      };

      // Update photo URLs only if we have new ones or need to remove old ones
      if (foodPhotoUrl || data.removeFoodPhoto) {
        updateData.foodPhotoUrl = foodPhotoUrl || null;
      }
      if (recipePhotoUrl || data.removeRecipePhoto) {
        updateData.recipePhotoUrl = recipePhotoUrl || null;
      }

      await updateDoc(recipeRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  async deleteRecipe(recipeId: string) {
    try {
      const recipeRef = doc(db, 'recipes', recipeId);
      await deleteDoc(recipeRef);
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }
};