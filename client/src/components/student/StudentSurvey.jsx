import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function StudentSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/surveys/${id}`);
      setSurvey(response.data);
      // Initialize answers array
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

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = {
        ...newAnswers[questionIndex],
        answer: value
      };
      return newAnswers;
    });
  };

  const handleCheckboxChange = (questionIndex, option, checked) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const currentAnswers = newAnswers[questionIndex].answer;

      if (checked) {
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          answer: [...currentAnswers, option]
        };
      } else {
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          answer: currentAnswers.filter(item => item !== option)
        };
      }

      return newAnswers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required questions
    const unansweredRequired = survey.questions.some(
      (q, index) => q.isRequired && 
      (answers[index].answer === '' || 
       (Array.isArray(answers[index].answer) && answers[index].answer.length === 0))
    );

    if (unansweredRequired) {
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

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[index]?.answer || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="3"
            required={question.isRequired}
          />
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index]?.answer === option}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="mr-2"
                  required={question.isRequired}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex flex-col items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={rating}
                  checked={answers[index]?.answer === rating.toString()}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="mb-1"
                  required={question.isRequired}
                />
                {rating}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={answers[index]?.answer.includes(option)}
                  onChange={(e) => handleCheckboxChange(index, option, e.target.checked)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600">Survey not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {survey.questions.map((question, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                {question.questionText}
                {question.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>
            </div>
            {renderQuestion(question, index)}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Survey
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentSurvey;