import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function CreateSurvey() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: []
  });

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      questionText: '',
      options: type === 'multiple-choice' || type === 'checkbox' ? [''] : [],
      isRequired: true
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setSurvey(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addOption = (questionIndex) => {
    setSurvey(prev => {
      const questions = [...prev.questions];
      questions[questionIndex].options.push('');
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setSurvey(prev => {
      const questions = [...prev.questions];
      questions[questionIndex].options[optionIndex] = value;
      return { ...prev, questions };
    });
  };

  const removeQuestion = (index) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!survey.title.trim() || !survey.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (survey.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/surveys', survey);
      toast.success('Survey created successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to create survey');
      console.error('Error creating survey:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Survey</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Survey Title
          </label>
          <input
            type="text"
            value={survey.title}
            onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={survey.description}
            onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Questions</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => addQuestion('text')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Text
              </button>
              <button
                type="button"
                onClick={() => addQuestion('multiple-choice')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add MCQ
              </button>
              <button
                type="button"
                onClick={() => addQuestion('rating')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Rating
              </button>
              <button
                type="button"
                onClick={() => addQuestion('checkbox')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Checkbox
              </button>
            </div>
          </div>

          {survey.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <input
                  type="text"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                  placeholder="Enter your question"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Add Option
                  </button>
                </div>
              )}

              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={(e) => updateQuestion(questionIndex, 'isRequired', e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Required</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Survey
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSurvey;