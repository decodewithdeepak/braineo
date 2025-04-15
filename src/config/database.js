import { Client, Databases, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const createLearningPath = async (userId, topicName, modules) => {
  try {
    return await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      ID.unique(),
      {
        userID: userId,
        topicName,
        modules: JSON.stringify(modules), // Convert array to string
        progress: 0,
        completedModules: JSON.stringify([]), // Initialize as empty array
        quizScores: JSON.stringify([]), // Initialize empty quiz scores array
        flashcardCount: 0, // Initialize flashcard count
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create learning path in database");
  }
};

export const getLearningPaths = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      [Query.equal("userID", userId)]
    );

    // Parse modules string back to array for each document
    return {
      ...response,
      documents: response.documents.map((doc) => ({
        ...doc,
        modules: JSON.parse(doc.modules),
        completedModules: JSON.parse(doc.completedModules || '[]'), // Parse completedModules
        quizScores: doc.quizScores ? JSON.parse(doc.quizScores) : [] // Parse quizScores if available
      })),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch learning paths");
  }
};

export const updateLearningPathProgress = async (pathId, progress) => {
  try {
    return await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId,
      {
        progress: Math.min(progress, 100), // Ensure progress doesn't exceed 100
        // Removed updatedAt field which was causing the error
      }
    );
  } catch (error) {
    console.error("Progress update error:", error);
    throw new Error("Failed to update progress");
  }
};

export const deleteLearningPath = async (pathId) => {
  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId
    );
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete learning path");
  }
};

// Updated to store quiz results within the career path document
export const updateUserProgress = async (userId, pathId, data) => {
  try {
    const doc = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId
    );
    
    // Parse existing quizScores or initialize empty array
    const quizScores = doc.quizScores ? JSON.parse(doc.quizScores) : [];
    
    // Update document with new quiz score and/or flashcard count
    return await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId,
      {
        quizScores: data.quizScores 
          ? JSON.stringify([...quizScores, data.quizScores])
          : doc.quizScores,
        flashcardCount: data.flashcardCount
          ? (parseInt(doc.flashcardCount || 0) + data.flashcardCount)
          : doc.flashcardCount,
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Progress update error:", error);
    throw error;
  }
};

// Get total flashcard count from all career paths for a user
export const getFlashcardCount = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      [Query.equal("userID", userId)]
    );
    
    // Sum up flashcard counts from all career paths
    return response.documents.reduce((total, doc) => {
      return total + (parseInt(doc.flashcardCount || 0));
    }, 0);
  } catch (error) {
    console.error("Error fetching flashcard count:", error);
    return 0;
  }
};

// Get user progress data from all career paths
export const getUserProgress = async (userId) => {
  try {
    const response = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      [Query.equal("userID", userId)]
    );
    
    // Combine quiz scores from all paths
    let allQuizScores = [];
    let totalFlashcardCount = 0;
    
    response.documents.forEach(doc => {
      // Add quiz scores from this path
      if (doc.quizScores) {
        const pathQuizScores = JSON.parse(doc.quizScores);
        if (Array.isArray(pathQuizScores)) {
          allQuizScores = [...allQuizScores, ...pathQuizScores];
        }
      }
      
      // Add flashcard count
      totalFlashcardCount += parseInt(doc.flashcardCount || 0);
    });
    
    return {
      flashcardCount: totalFlashcardCount,
      quizScores: allQuizScores,
      paths: response.documents.map(doc => ({
        id: doc.$id,
        name: doc.topicName,
        progress: doc.progress,
        completedModules: doc.completedModules ? JSON.parse(doc.completedModules) : [],
        updatedAt: doc.updatedAt
      }))
    };
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return { flashcardCount: 0, quizScores: [], paths: [] };
  }
};

export const markModuleComplete = async (pathId, moduleIndex) => {
  try {
    const doc = await databases.getDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId
    );

    const completedModules = JSON.parse(doc.completedModules || '[]');
    if (!completedModules.includes(moduleIndex.toString())) {
      completedModules.push(moduleIndex.toString());
    }

    const progress = Math.round((completedModules.length / JSON.parse(doc.modules).length) * 100);

    const updated = await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID,
      pathId,
      {
        completedModules: JSON.stringify(completedModules),
        progress,
      }
    );

    return updated;
  } catch (err) {
    console.error("Failed to mark module complete:", err);
    throw err;
  }
};


export const saveQuizScore = async ({ userID, pathID, moduleID, moduleName, score, feedback, timestamp }) => {
  try {
    const res = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      "assessments", // 👈 Collection ID
      ID.unique(),
      {
        userID,
        pathID,
        moduleID,
        moduleName, // ✅ added module title
        score,
        feedback,
        timestamp
      }

      

    );
    console.log("✅ Score saved in assessments:", res);
    return res;
  } catch (err) {
    console.error("❌ Failed to save quiz score:", err);
    throw err;
  }
};



export const getQuizScores = async ({
  userId = null,
  pathId = null,
  moduleId = null,
} = {}) => {
  try {
    const queries = [];

    if (userId) queries.push(Query.equal("userID", userId));
    if (pathId) queries.push(Query.equal("pathID", pathId));
    if (moduleId) queries.push(Query.equal("moduleID", moduleId));

    const res = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      "assessments",
      queries
    );

    return res.documents;
  } catch (error) {
    console.error("❌ Error fetching quiz scores:", error);
    return [];
  }
};
