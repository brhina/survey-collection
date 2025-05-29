import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function SurveyResults() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveyAndResults();
  }, [id]);

  const fetchSurveyAndResults = async () => {
    try {
      const [surveyRes, resultsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/surveys/${id}`),
        axios.get(`http://localhost:5000/api/responses/survey/${id}/results`)
      ]);
      setSurvey(surveyRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      toast.error('Failed to fetch survey results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (question, result) => {
    if (!result) return null;

    switch (question.type) {
      case 'multiple-choice':
      case 'checkbox': {
        const data = Object.entries(result.optionCounts).map(([label, value]) => ({
          label,
          value
        }));

        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {question.type === 'multiple-choice' ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        );
      }

      case 'rating': {
        return (
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {result.averageRating.toFixed(1)}
            </p>
            <p className="text-gray-600">Average Rating</p>
          </div>
        );
      }

      case 'text': {
        return (
          <div className="space-y-2">
            {result.responses.map((response, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                {response}
              </div>
            ))}
          </div>
        );
      }

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

  if (!survey || !results) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600">Survey not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Total Responses: <span className="font-bold">{results.totalResponses}</span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {survey.questions.map((question, index) => {
          const result = results.results[index];
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {question.questionText}
              </h3>
              {renderChart(question, result)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SurveyResults;