import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiPlayCircleLine,
  RiBrainLine,
  RiLightbulbLine,
  RiBarChartBoxLine,
} from "react-icons/ri";
import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // Add this import
import { RiUserStarLine, RiLineChartLine, RiQuestionAnswerLine, RiTimerLine } from "react-icons/ri";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Data
const features = [
  {
    icon: <RiUserStarLine className="text-3xl text-white" />,
    title: "Adaptive Learning Paths",
    description: "AI creates custom learning journeys based on your goals, interests, and skill level.",
    iconBg: "bg-blue-600",
    cardBg: "bg-blue-50",
    borderColor: "border-blue-600",
  },
  {
    icon: <RiLineChartLine className="text-3xl text-white" />,
    title: "Smart Progress Tracking",
    description: "Visualize your growth with analytics that identify strengths and improvement areas.",
    iconBg: "bg-green-500",
    cardBg: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    icon: <RiQuestionAnswerLine className="text-3xl text-white" />,
    title: "Interactive Fun Quizzes",
    description: "Engage with adaptive assessments that provide real-time feedback on your learning.",
    iconBg: "bg-red-500",
    cardBg: "bg-red-50",
    borderColor: "border-red-500",
  },
  {
    icon: <RiTimerLine className="text-3xl text-white" />,
    title: "AI Learning Nudges",
    description: "Receive personalized recommendations and reminders to keep your learning on track.",
    iconBg: "bg-purple-600",
    cardBg: "bg-purple-50",
    borderColor: "border-purple-600",
  },
];

const stats = [
  { number: "10K+", label: "Active Learners" },
  { number: "1000+", label: "Learning Paths" },
  { number: "95%", label: "Success Rate" },
  { number: "24/7", label: "AI Assistance" },
];

const testimonials = [
  {
    name: "Deepak Modi",
    role: "Frontend Dev",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    quote: "Braineo completely transformed how I learn. The AI recommendations are spot-on!",
  },
  {
    name: "Shetal Bhardwaj",
    role: "Engineering Student",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    quote: "I love the interactive paths and quizzes — they keep me engaged and motivated.",
  },
  {
    name: "Vishal Singh",
    role: "Data Analyst",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    quote: "The smart progress tracking helped me identify and fix my weak spots easily.",
  },
];

const faqs = [
  {
    q: "How does the AI personalize my learning?",
    a: "Our AI analyzes your performance, preferences, and goals to adaptively recommend modules, track your growth, and optimize your learning path.",
  },
  {
    q: "Is Braineo suitable for complete beginners?",
    a: "Absolutely! Whether you're a beginner or an advanced learner, Braineo adjusts difficulty and content to match your level.",
  },
  {
    q: "Can I learn at my own pace?",
    a: "Yes! Braineo is fully self-paced. You can pause, resume, or skip modules anytime you like.",
  },
  {
    q: "What kind of content is available?",
    a: "Interactive modules, flashcards, quizzes, and real-world projects — all backed by AI for maximum impact.",
  },
];

// Component for animated counter
const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Special case for non-numeric values like "24/7"
  if (target === "24/7") {
    return <span ref={ref}>{target}</span>;
  }

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const isPlus = target.includes("+");
    const isPercent = target.includes("%");
    const hasK = target.includes("K");

    const rawNumber = parseInt(target.replace(/\D/g, ""), 10);
    const end = hasK ? rawNumber * 1000 : rawNumber;

    // Increase animation speed by reducing total steps and increasing step size
    const totalSteps = Math.floor(duration / 20); // Changed from 40 to 20
    const step = Math.max(1, Math.floor(end / totalSteps) * 2); // Double the step size

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20); // Reduced from 40ms to 20ms for faster updates

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const display = target.includes("K")
    ? `${Math.floor(count / 1000)}K+`
    : target.includes("+")
      ? `${count}+`
      : target.includes("%")
        ? `${count}%`
        : count;

  return <span ref={ref}>{display}</span>;
};

// Component for FAQ item
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all cursor-pointer hover:bg-gray-100 hover:border-gray-400"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center text-gray-800 font-medium">
        {question}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="text-gray-600 text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hero Section Component
const HeroSection = ({ navigate }) => {
  const { isAuthenticated } = useAuth();

  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-blue-200 via-white to-indigo-200 overflow-hidden py-16 sm:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Decorative Shapes */}
      <div className="absolute top-20 right-[10%] w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-[10%] w-32 h-32 md:w-48 md:h-48 bg-gradient-to-bl from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-radial from-blue-400/20 via-transparent to-transparent opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-300 shadow-md">
                <span role="img" aria-label="brain">🧠</span> AI-Powered Learning Platform
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-center">
              <span className="block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 animate-gradient-x">
                You + AI = Braineo Mode
              </span>
              <span className="block mt-2 text-gray-900 text-3xl sm:text-4xl lg:text-5xl">
                Smarter Learning Begins Here
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-3xl mx-auto mt-4 text-center text-base sm:text-lg lg:text-xl text-gray-600">
              Say goodbye to boring. Braineo brings hyper-personalized learning, real-time feedback, and intelligent practice. You're not just learning - you're leveling up.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button
                onClick={handleStartLearning}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
            shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 
            transform hover:-translate-y-1 transition-all duration-200
            border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                Start Learning Free
                <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-blue-600 text-gray-700 
            font-medium rounded-xl hover:bg-blue-50 hover:border-blue-200 transform hover:-translate-y-1 
            transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                See How It Works
                <RiPlayCircleLine className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Highlight cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24"
          >
            {[
              { icon: "🧠", title: "Smart Learning", desc: "Personalized paths tailored for you" },
              { icon: "⚡", title: "Fast Progress", desc: "Achieve goals quicker with AI" },
              { icon: "🔍", title: "Adaptive Content", desc: "Materials that suit your needs " }
            ].map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Floating badges */}
          <div className="absolute top-1/16 -left-4 md:left-0 animate-float-slow hidden md:block">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-100 text-sm font-medium text-blue-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                1000+ Active Learners
              </div>
            </div>
          </div>

          <div className="absolute bottom-1/4 -right-4 md:right-0 animate-float hidden md:block">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-100 text-sm font-medium text-indigo-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                95% Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  return (
    <section className="relative w-full bg-gradient-to-b from-white to-gray-50/50 py-16 sm:py-24 px-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-10 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute left-0 bottom-10 w-64 h-64 bg-indigo-100 rounded-full filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
            Why Choose Our Platform?
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our AI-powered learning system adapts to your needs and helps you achieve results faster
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`rounded-2xl p-6 md:p-8 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-md border ${feature.cardBg} ${feature.borderColor}`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl mx-auto mb-5 md:mb-6 ${feature.iconBg} shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-sm md:text-base text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Section Component
const StatsSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-100 to-indigo-100 py-16 sm:py-24 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute -right-10 top-10 w-52 h-52 bg-blue-200/40 rounded-full blur-3xl"></div>
      <div className="absolute -left-10 bottom-10 w-52 h-52 bg-indigo-200/40 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <span className="inline-block px-3 py-1 bg-white/60 backdrop-blur-sm text-blue-600 rounded-full text-sm font-medium mb-4">
            Achievements
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
            Our Impact in Numbers
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Join thousands of learners who are already transforming their skills with our platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-5 md:p-6 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all shadow-md"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
                <AnimatedCounter target={stat.number} />
              </div>
              <div className="text-gray-600 text-xs md:text-sm mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  return (
    <section className="bg-gray-50 py-16 sm:py-24 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-100 rounded-full filter blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="text-center mb-10 md:mb-16">

          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
            What Learners Are Saying
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our community of successful learners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/90 backdrop-blur-sm p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 text-left"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-indigo-100" />
                <div>
                  <div className="font-semibold text-gray-800">{t.name}</div>
                  <div className="text-xs md:text-sm text-indigo-500">{t.role}</div>
                </div>
              </div>
              <div className="text-yellow-400 text-lg mb-2">★★★★★</div>
              <p className="text-gray-600 text-sm md:text-base">"{t.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Section Component
const FaqSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-1/4 w-64 h-64 bg-blue-50 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-indigo-50 rounded-full filter blur-3xl opacity-50"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform and learning methods
          </p>
        </div>

        <div className="space-y-4 md:space-y-5 text-left">
          {faqs.map((item, i) => (
            <FaqItem key={i} question={item.q} answer={item.a} />
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a href="#contact" className="inline-flex items-center px-5 py-2 font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CtaSection = ({ navigate }) => {
  return (
    <section className="px-4 mx-6 my-10 sm:mx-8 sm:my-12 relative">
      <div className="py-16 sm:py-24 bg-blue-50 border border-blue-600 rounded-2xl">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-blue-200 backdrop-blur-sm p-1 rounded-full inline-block mb-6"
          >
            <span className="px-4 py-1 text-blue-600 text-sm">Join over 10,000 learners</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-blue-600"
          >
            Ready to Elevate Your Skills with AI?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 mb-8 text-base md:text-lg max-w-2xl mx-auto"
          >
            Join thousands of learners transforming their future through smart, guided learning. Start your journey today!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white font-medium rounded-xl shadow-lg
                hover:shadow-xl transition-all duration-200
                border border-blue-600"
            >
              Start Learning Now 🚀
            </motion.button>
            <button className="px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 rounded-xl
              hover:bg-blue-100 transition-all duration-200
              border border-blue-600 font-medium shadow-md">
              View Courses
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// CSS Styles Component
const CssStyles = () => {
  return (
    <style>{`
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 15s ease infinite;
      }
      
      @keyframes gradient-x {
        0% { background-position: 0% 50% }
        50% { background-position: 100% 50% }
        100% { background-position: 0% 50% }
      }
      
      .bg-grid-pattern {
        background-image: 
          linear-gradient(to right, #6366f1 1px, transparent 1px),
          linear-gradient(to bottom, #6366f1 1px, transparent 1px);
        background-size: 40px 40px;
      }
      
      .bg-gradient-radial {
        background-image: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
      }
      
      .animate-float {
        animation: float 5s ease-in-out infinite;
      }
      
      .animate-float-slow {
        animation: float 7s ease-in-out infinite;
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
    `}</style>
  );
};

// Main Home Component
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden">
      <HeroSection navigate={navigate} />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection navigate={navigate} />
      <CssStyles />
    </div>
  );
};

export default Home;
