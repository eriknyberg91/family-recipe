// User related types
export interface User {
    uid: string;
    email: string;
    displayName?: string;
  }
  
  // Recipe related types
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
  
  // Review related types
  export interface Review {
    id: string;
    recipeId: string;
    userId: string;
    userName?: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }