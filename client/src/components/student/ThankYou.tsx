import { Link } from 'react-router-dom';

function ThankYou() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Thank You!
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Your response has been recorded successfully. We appreciate your feedback!
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ThankYou;
