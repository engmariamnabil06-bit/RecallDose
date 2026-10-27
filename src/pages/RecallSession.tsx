import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

type RecallOption = {
  id: string;
  text: string;
};

type RecallQuestion = {
  id: string;
  order: number;
  text: string;
  type: string;
  difficulty: string;
  subject: string | null;
  topic: string | null;
  options: RecallOption[];
};

type RecallSessionData = {
  session: {
    id: string;
    status: string;
    totalQuestions: number;
    startedAt: string;
  };
  questions: RecallQuestion[];
};

type AnswerResult = {
  answer: {
    id: string;
    isCorrect: boolean;
    selectedOptionId: string;
  };
  question: {
    id: string;
    explanation: string | null;
  };
  session: {
    id: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedAnswers: number;
  };
};

const RecallSession = () => {
  const navigate = useNavigate();

  const [sessionData, setSessionData] =
    useState<RecallSessionData | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [selectedOptionId, setSelectedOptionId] =
    useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const [answerResult, setAnswerResult] =
    useState<AnswerResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          apiUrl("/api/recall/session"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              count: 5,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not start recall session."
          );
        }

        setSessionData(data);
      } catch (error) {
        console.error(
          "START RECALL SESSION ERROR:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Something went wrong while starting your recall session."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    startSession();
  }, []);

  const currentQuestion =
    sessionData?.questions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (
      !selectedOptionId ||
      submitted ||
      !sessionData ||
      !currentQuestion
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(
        apiUrl(`/api/recall/session/${sessionData.session.id}/answer`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questionId: currentQuestion.id,
            selectedOptionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not submit answer."
        );
      }

      setAnswerResult(data);
      setSubmitted(true);
    } catch (error) {
      console.error(
        "SUBMIT RECALL ANSWER ERROR:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong while submitting your answer."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!sessionData) {
      return;
    }

    const isLastQuestion =
      currentQuestionIndex ===
      sessionData.questions.length - 1;

    if (isLastQuestion) {
      navigate("/dashboard");
      return;
    }

    setCurrentQuestionIndex(
      (currentIndex) => currentIndex + 1
    );

    setSelectedOptionId(null);
    setSubmitted(false);
    setAnswerResult(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="recall-session-page">
        <div className="recall-session-inner">
          <div className="session-loading">
            <span className="session-loading-line"></span>

            <h1>Preparing your recall session.</h1>

            <p>
              Selecting questions based on your current
              learning profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="recall-session-page">
        <div className="recall-session-inner">
          <div className="session-error">
            <span className="feature-eyebrow">
              RECALL ENGINE
            </span>

            <h1>We couldn't start your session.</h1>

            <p>{error}</p>

            <Link
              to="/recall"
              className="feature-primary-button"
            >
              Back to Recall
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData || !currentQuestion) {
    return (
      <div className="recall-session-page">
        <div className="recall-session-inner">
          <div className="session-error">
            <h1>No questions available.</h1>

            <p>
              There are currently no questions available
              for your academic profile.
            </p>

            <Link
              to="/dashboard"
              className="feature-primary-button"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress =
    ((currentQuestionIndex + 1) /
      sessionData.questions.length) *
    100;

  const isCorrect =
    answerResult?.answer.isCorrect ?? false;

  const correctOption =
    answerResult &&
    currentQuestion.options.find(
      (option) =>
        option.id !== answerResult.answer.selectedOptionId
    );

  return (
    <div className="recall-session-page">
      <div className="recall-session-inner">
        <header className="recall-session-header">
          <Link
            to="/recall"
            className="session-back"
          >
            ← Exit session
          </Link>

          <div className="session-progress-info">
            <span>
              QUESTION {currentQuestionIndex + 1}
            </span>

            <span>
              {currentQuestionIndex + 1} /{" "}
              {sessionData.questions.length}
            </span>
          </div>

          <div className="session-progress-bar">
            <span
              style={{
                width: `${progress}%`,
              }}
            ></span>
          </div>
        </header>

        <main className="question-container">
          <div className="question-meta">
            {currentQuestion.subject && (
              <span>{currentQuestion.subject}</span>
            )}

            {currentQuestion.topic && (
              <span>{currentQuestion.topic}</span>
            )}

            <span>{currentQuestion.difficulty}</span>
          </div>

          <h1>{currentQuestion.text}</h1>

          <div className="question-options">
            {currentQuestion.options.map(
              (option, index) => {
                const isSelected =
                  selectedOptionId === option.id;

                const isCorrectOption =
                  submitted &&
                  answerResult?.answer.isCorrect ===
                    false &&
                  option.id === correctOption?.id;

                const isWrongSelectedOption =
                  submitted &&
                  !isCorrect &&
                  isSelected;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`question-option ${
                      isSelected ? "selected" : ""
                    } ${
                      isCorrectOption
                        ? "correct"
                        : ""
                    } ${
                      isWrongSelectedOption
                        ? "incorrect"
                        : ""
                    }`}
                    onClick={() => {
                      if (!submitted && !isSubmitting) {
                        setSelectedOptionId(
                          option.id
                        );
                      }
                    }}
                    disabled={
                      submitted || isSubmitting
                    }
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="option-text">
                      {option.text}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {error && (
            <div className="answer-submit-error">
              <p>{error}</p>
            </div>
          )}

          {!submitted ? (
            <button
              type="button"
              className="submit-answer-button"
              disabled={
                !selectedOptionId || isSubmitting
              }
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Checking..."
                : "Check Answer →"}
            </button>
          ) : (
            <div
              className={`answer-feedback ${
                isCorrect
                  ? "answer-feedback-correct"
                  : "answer-feedback-incorrect"
              }`}
            >
              <div className="answer-feedback-content">
                <strong>
                  {isCorrect
                    ? "Correct answer."
                    : "Incorrect answer."}
                </strong>

                <p>
                  {answerResult?.question
                    .explanation ||
                    (isCorrect
                      ? "Good recall. Keep building on this concept."
                      : "This question has been added to your mistake history for review.")}
                </p>
              </div>

              <button
                type="button"
                className="next-question-button"
                onClick={handleNext}
              >
                {currentQuestionIndex ===
                sessionData.questions.length - 1
                  ? "Finish Session"
                  : "Next Question →"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecallSession;