import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Survey } from '../../types';

function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async (): Promise<void> => {
    try {
      const response = await axios.get<Survey[]>('http://localhost:5000/api/surveys');
      setSurveys(response.data);
    } catch (error) {
      toast.error('Failed to fetch surveys');
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/surveys/${id}`);
      toast.success('Survey deleted successfully');
      fetchSurveys();
    } catch (error) {
      toast.error('Failed to delete survey');
      console.error('Error deleting survey:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Surveys Dashboard</h1>
        <Link
          to="/admin/create"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Create New Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600">No surveys found</h2>
          <p className="text-gray-500 mt-2">Create your first survey to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{survey.title}</h3>
              <p className="text-gray-600 mb-4">{survey.description}</p>
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Link
                    to={`/admin/results/${survey._id}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View Results
                  </Link>
                  <button
                    onClick={() => deleteSurvey(survey._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <Link
                  to={`/survey/${survey._id}`}
                  className="text-green-500 hover:text-green-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Take Survey
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
