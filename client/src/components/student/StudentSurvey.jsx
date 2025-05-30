import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function StudentSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/surveys/${id}`);
      setSurvey(response.data);
      setAnswers(response.data.questions.map(q => ({
        questionId: q._id,
        answer: q.type === 'checkbox' ? [] : ''
      })));
    } catch (error) {
      toast.error('Failed to fetch survey');
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (survey) {
      const progress = (currentQuestionIndex / survey.questions.length) * 100;
      setProgress(progress);
    }
  }, [currentQuestionIndex, survey]);

  const handleAnswerChange = (value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = {
        ...newAnswers[currentQuestionIndex],
        answer: value
      };
      return newAnswers;
    });
  };

  const handleCheckboxChange = (option, checked) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const currentAnswers = newAnswers[currentQuestionIndex].answer;

      if (checked) {
        newAnswers[currentQuestionIndex] = {
          ...newAnswers[currentQuestionIndex],
          answer: [...currentAnswers, option]
        };
      } else {
        newAnswers[currentQuestionIndex] = {
          ...newAnswers[currentQuestionIndex],
          answer: currentAnswers.filter(item => item !== option)
        };
      }

      return newAnswers;
    });
  };

  const handleNext = () => {
    const currentQuestion = survey.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex].answer;

    if (currentQuestion.isRequired && 
        (currentAnswer === '' || 
         (Array.isArray(currentAnswer) && currentAnswer.length === 0))) {
      toast.error('Please answer this question before proceeding');
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const currentQuestion = survey.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex].answer;

    if (currentQuestion.isRequired && 
        (currentAnswer === '' || 
         (Array.isArray(currentAnswer) && currentAnswer.length === 0))) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/responses', {
        surveyId: id,
        answers
      });
      toast.success('Survey submitted successfully');
      navigate('/thank-you');
    } catch (error) {
      toast.error('Failed to submit survey');
      console.error('Error submitting survey:', error);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <textarea
              value={answers[currentQuestionIndex]?.answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
              placeholder="Type your answer here..."
              required={question.isRequired}
            />
          </motion.div>
        );

      case 'multiple-choice':
        return (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {question.options.map((option, optionIndex) => (
              <motion.div
                key={optionIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: optionIndex * 0.1 }}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={answers[currentQuestionIndex]?.answer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required={question.isRequired}
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'rating':
        return (
          <motion.div
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <motion.label
                key={rating}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  answers[currentQuestionIndex]?.answer === rating.toString()
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={rating}
                  checked={answers[currentQuestionIndex]?.answer === rating.toString()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="sr-only"
                  required={question.isRequired}
                />
                <span className="text-2xl font-bold">{rating}</span>
              </motion.label>
            ))}
          </motion.div>
        );

      case 'checkbox':
        return (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {question.options.map((option, optionIndex) => (
              <motion.div
                key={optionIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: optionIndex * 0.1 }}
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    value={option}
                    checked={answers[currentQuestionIndex]?.answer.includes(option)}
                    onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              </motion.div>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Survey not found</h2>
        <p className="text-gray-500">The survey you're looking for doesn't exist.</p>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Survey header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <p className="text-lg text-gray-600">{survey.description}</p>
        </div>

        {/* Question card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.questionText}
            {currentQuestion.isRequired && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h2>

          {renderQuestion(currentQuestion)}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-500 hover:bg-blue-50'
            }`}
          >
            Previous
          </button>

          {currentQuestionIndex === survey.questions.length - 1 ? (
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
            >
              Submit Survey
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
            >
              Next
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentSurvey;