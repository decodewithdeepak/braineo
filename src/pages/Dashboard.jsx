import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { account } from "../config/appwrite";
import { databases } from "../config/database";
import { Query } from "appwrite";
import { toast } from "react-hot-toast";
import { generateAINudges } from "../config/gemini";
import NudgeCard from "../components/NudgeCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizScores, setQuizScores] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState({
    completedPaths: 0,
    totalModulesCompleted: 0,
    avgQuizScore: 0
  });
  const [aiNudges, setAiNudges] = useState([]);

  // Get environment variables for Appwrite database and collections
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const CAREER_COLLECTION_ID = import.meta.env.VITE_CAREER_PATHS_COLLECTION_ID;
  const ASSESSMENTS_COLLECTION_ID = import.meta.env.VITE_ASSESSMENTS_COLLECTION_ID;
  const USER_PROGRESS_COLLECTION_ID = import.meta.env.VITE_USER_PROGRESS_COLLECTION_ID;

  useEffect(() => {
    const fetchAllUserData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserProgress(),
          fetchPaths(),
          fetchRecentActivity()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUserData();
  }, []);

  useEffect(() => {
    const fetchNudges = async () => {
      if (user && paths.length > 0 && recentActivity.length > 0) {
        try {
          const nudges = await generateAINudges(user, recentActivity, paths[0]);
          setAiNudges(nudges);
        } catch (error) {
          console.error("Error fetching nudges:", error);
        }
      }
    };

    fetchNudges();
  }, [user, paths, recentActivity]);

  const fetchRecentActivity = async () => {
    try {
      const user = await account.get();

      const assessmentsResponse = await databases.listDocuments(
        DATABASE_ID,
        ASSESSMENTS_COLLECTION_ID,
        [
          Query.equal("userID", user.$id),
          Query.orderDesc("timestamp"),
          Query.limit(5),
        ]
      );

      const activities = assessmentsResponse.documents
        .filter((assessment) => assessment.feedback?.includes("Accuracy")) // ✅ Keep only quizzes
        .map((assessment) => {
          const accuracyMatch = assessment.feedback?.match(/Accuracy:\s*(\d+(?:\.\d+)?)%/);
          const accuracy = accuracyMatch ? parseFloat(accuracyMatch[1]) : null;

          return {
            type: "quiz",
            moduleID: assessment.moduleID,
            moduleName: assessment.moduleName || (
              assessment.moduleID !== "all"
                ? `Module ${parseInt(assessment.moduleID) + 1}`
                : "All Modules"
            ),
            date: assessment.timestamp,
            score: assessment.score,
            total: 10,
            accuracy,
            feedback: assessment.feedback || null,
          };
        });

      setRecentActivity(activities);


      setRecentActivity(activities);
    } catch (error) {
      console.error("❌ Error fetching recent activity:", error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const user = await account.get(); // Get logged-in user

      // Fetch career paths to get flashcard count
      const pathsResponse = await databases.listDocuments(
        DATABASE_ID,
        CAREER_COLLECTION_ID,
        [Query.equal("userID", user.$id)]
      );
      
      // Calculate total flashcards from all paths
      let totalFlashcardsMastered = 0;
      pathsResponse.documents.forEach(path => {
        if (path.flashcardCount) {
          totalFlashcardsMastered += parseInt(path.flashcardCount || 0);
        }
      });
      
      setFlashcardCount(totalFlashcardsMastered);

      // Fetch assessments for this user
      const assessmentsResponse = await databases.listDocuments(
        DATABASE_ID,
        ASSESSMENTS_COLLECTION_ID,
        [Query.equal("userID", user.$id)]
      );

      let quizScoresData = [];
      let totalQuizScore = 0;
      let totalQuizCount = 0;

      // Process assessments data
      assessmentsResponse.documents.forEach(assessment => {
        if (assessment.quizScore) {
          const score = parseInt(assessment.quizScore);
          const total = parseInt(assessment.quizTotal || 10);

          // Add quiz data with date and score
          quizScoresData.push({
            moduleID: assessment.moduleID,
            moduleName: assessment.moduleName || 'Module',
            score: score,
            total: total,
            accuracy: ((score / total) * 100).toFixed(1),
            date: assessment.completedAt || assessment.timestamp || new Date().toISOString(),
          });

          totalQuizScore += score;
          totalQuizCount += 1;
        }
      });

      setQuizScores(quizScoresData);

      // Update user stats
      setUserStats(prev => ({
        ...prev,
        avgQuizScore: totalQuizCount > 0 ? (totalQuizScore / totalQuizCount).toFixed(1) : 0
      }));

      // Calculate streak from quiz dates
      if (quizScoresData.length > 0) {
        const dates = quizScoresData.map(q => new Date(q.date).toDateString());
        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const dateDiff = Math.round(
              (new Date(uniqueDates[i - 1]) - new Date(uniqueDates[i])) / 86400000
            );
            if (dateDiff === 1) streak++;
            else break;
          }
        }

        setCurrentStreak(streak);
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
      toast.error("Failed to load user progress");
    }
  };

  const fetchPaths = async () => {
    try {
      const user = await account.get();

      // Query career paths collection for this user
      const response = await databases.listDocuments(
        DATABASE_ID,
        CAREER_COLLECTION_ID,
        [Query.equal("userID", user.$id)]
      );

      if (response.documents.length > 0) {
        // Process the paths data
        const processedPaths = response.documents.map(path => {
          return {
            ...path,
            modules: path.modules ? JSON.parse(path.modules) : [],
            aiNudges: path.aiNudges ? JSON.parse(path.aiNudges) : [],
            completedModules: path.completedModules ? JSON.parse(path.completedModules) : []
          };
        });

        // Filtering paths where progress is less than 100
        const incompletePaths = processedPaths.filter(
          (path) => path.progress < 100
        );

        const completedPaths = processedPaths.filter(
          (path) => path.progress >= 100
        );

        setPaths(incompletePaths);

        // Calculate total completed modules
        const totalModulesCompleted = processedPaths.reduce((total, path) => {
          return total + (path.completedModules?.length || 0);
        }, 0);

        // Update user stats
        setUserStats(prev => ({
          ...prev,
          completedPaths: completedPaths.length,
          totalModulesCompleted
        }));
      } else {
        // If no paths found
        setPaths([]);
      }
    } catch (error) {
      console.error("Error fetching paths:", error);
      toast.error("Failed to load learning paths");
    }
  };

  const calculateSuccessRate = () => {
    if (!quizScores.length) return 0; // Avoid division by zero

    const totalAccuracy = quizScores.reduce(
      (sum, score) => sum + parseFloat(score.accuracy),
      0
    );

    return (totalAccuracy / quizScores.length).toFixed(1); // Average accuracy
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function for card skeletons
  const CardSkeleton = () => (
    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg animate-pulse">
      <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
      <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
    </div>
  );

  const cards = [
    {
      title: "Continue Learning",
      description: "Pick up where you left off",
      icon: "📚",
      gradient: "from-blue-500 to-indigo-500",
      path: "/learning-path",
      stats: `${paths.length} ${paths.length === 1 ? 'path' : 'paths'} in progress`,
    },
    {
      title: "Flashcards",
      description: "Review and memorize concepts",
      icon: "🗂️",
      gradient: "from-purple-500 to-pink-500",
      path: "/flashcards",
      stats: `${flashcardCount} ${flashcardCount === 1 ? 'card' : 'cards'} mastered`,
    },
    {
      title: "Quiz Performance",
      description: "Test your knowledge",
      icon: "📊",
      gradient: "from-indigo-500 to-blue-500",
      path: "/quiz",
      stats: `${calculateSuccessRate()}% success rate`,
    },
  ];

  const quickActions = [
    {
      icon: "🎯",
      label: "New Path",
      description: "Start a learning journey",
      path: "/learning-path",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      icon: "🗂️",
      label: "Flashcards",
      description: "Create study cards",
      path: "/flashcards",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: "📝",
      label: "Quiz",
      description: "Test your knowledge",
      path: "/quiz",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: "📈",
      label: "Progress",
      description: "Track your growth",
      path: "/progress",
      gradient: "from-pink-600 to-rose-600"
    },
  ];

  return (
    <div className="flex-1 max-w-full p-4 md:p-6 mt-4 overflow-x-hidden bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Enhanced Welcome Section with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white/30 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-lg border border-white/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(" ")[0] || "Learner"}! 👋
                </h1>
                <p className="text-gray-600">
                  Your learning journey continues today
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl flex items-center gap-2">
                  <span className="text-xl">🔥</span> {currentStreak} day streak
                </div>
                {isLoading ? (
                  <div className="px-4 py-2 bg-gray-100 rounded-xl w-24 h-9 animate-pulse"></div>
                ) : (
                  <div className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    Avg Quiz: {userStats.avgQuizScore}/10
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats cards */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white/40 p-4 rounded-xl shadow-sm">
                <p className="text-gray-500 text-sm">Paths Progress</p>
                <p className="text-2xl font-semibold">{paths.length}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-xl shadow-sm">
                <p className="text-gray-500 text-sm">Paths Completed</p>
                <p className="text-2xl font-semibold">{userStats.completedPaths}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-xl shadow-sm">
                <p className="text-gray-500 text-sm">Modules Completed</p>
                <p className="text-2xl font-semibold">{userStats.totalModulesCompleted}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-xl shadow-sm">
                <p className="text-gray-500 text-sm">Success Rate</p>
                <p className="text-2xl font-semibold">{calculateSuccessRate()}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative space-y-3">
                <span className="text-3xl block mb-2">{action.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Main content area with conditional loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Enhanced Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                  }}
                  onClick={() => navigate(card.path)}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow transition-all duration-300 cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative space-y-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {card.title}
                      </h2>
                      <p className="text-gray-600">{card.description}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600">
                      {card.stats}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add nudges section */}
            {!isLoading && aiNudges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {aiNudges.map((nudge, index) => (
                  <NudgeCard
                    key={index}
                    text={nudge.text}
                    type={nudge.type}
                    icon={nudge.icon}
                    actionText={nudge.actionText}
                    onAction={() => navigate('/learning-path')}
                  />
                ))}
              </motion.div>
            )}

            {/* Two-column layout for Paths and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Learning Paths Column */}
              <div className="lg:col-span-3">
                {paths.length > 0 ? (
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="text-blue-600">📚</span> Your Learning Paths
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {paths.map((path, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="bg-blue-50/70 p-4 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-blue-900">{path.careerName}</h3>
                            <span className="text-sm bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                              {path.progress}%
                            </span>
                          </div>
                          <div className="mt-3 h-2.5 bg-blue-100 rounded-full">
                            <div
                              className="h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${path.progress}%` }}
                            ></div>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {path.completedModules?.length || 0}/{path.modules?.length || 0} modules
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/learning-path/${path.$id}`);
                              }}
                              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Continue
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {paths.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No paths in progress yet</p>
                        <button
                          onClick={() => navigate('/learning-path')}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Create a Learning Path
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow text-center py-12">
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="text-xl font-medium mb-2">Start Your Learning Journey</h3>
                    <p className="text-gray-500 mb-6">Create your first learning path and begin your journey to success</p>
                    <button
                      onClick={() => navigate('/learning-path')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Create Path
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity Column */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-indigo-600">📊</span> Recent Quiz Activity
                  </h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="border-l-4 border-indigo-400 pl-4 py-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">
                                {activity.type === 'quiz' ? '📝 Quiz' : '🗂️ Flashcards'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {activity.moduleName || "Untitled Module"}
                              </p>
                            </div>

                            {activity.type === 'quiz' && (
                              <div className="flex flex-col items-end text-right">
                                <span className="bg-indigo-100 text-center text-indigo-700 text-xs px-2.5 py-1 rounded-full break-words max-w-[120px]">
                                  {activity.feedback || "No feedback"}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No activity recorded yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Complete quizzes to see your progress
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
