import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 px-6">
          <div className="text-center">
              {/* Illustration */}
              <svg
                  className="mx-auto mb-6 w-48 h-48 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 48 48"
              >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20l12-8 12 8M12 28l12 8 12-8M12 20v8m24-8v8"
                  />
              </svg>

              {/* Titre */}
              <h1 className="text-6xl font-extrabold mb-2">404</h1>
              <p className="text-xl text-gray-600 mb-6">
                  Oups ! Cette page est introuvable.
              </p>

              {/* Bouton retour */}
              <a
                  href="/"
                  className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition"
              >
                  Retour à l'accueil
              </a>
          </div>
      </div>
  );
};

export default NotFound;