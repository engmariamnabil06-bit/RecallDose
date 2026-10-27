import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  sessionId: string;
};

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          apiUrl("/api/auth/me"),
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        console.error(
          "SESSION CHECK ERROR:",
          error
        );

        setUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, []);

  if (isChecking) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-welcome">
              <span className="welcome-spark">
                ✦
              </span>

              <span className="auth-eyebrow">
                RECALLDOSE
              </span>

              <h1>
                Checking your session...
              </h1>

              <p>
                Preparing your medical journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;