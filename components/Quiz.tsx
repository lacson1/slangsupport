import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizScore } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface QuizProps {
  questions: QuizQuestion[];
  onClose: () => void;
  onComplete: (score: QuizScore) => void;
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  onClose,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    setShowResult(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (isLastQuestion) {
        const finalScore: QuizScore = {
          score,
          total: questions.length,
          date: Date.now()
        };
        setQuizComplete(true);
        onComplete(finalScore);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore: QuizScore = {
        score,
        total: questions.length,
        date: Date.now()
      };
      setQuizComplete(true);
      onComplete(finalScore);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getAnswerClass = (answer: string) => {
    if (!showResult) {
      return selectedAnswer === answer
        ? 'bg-cyan-600 border-cyan-500 text-white'
        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600';
    }

    if (answer === currentQuestion.correctAnswer) {
      return 'bg-green-600 border-green-500 text-white';
    } else if (answer === selectedAnswer && answer !== currentQuestion.correctAnswer) {
      return 'bg-red-600 border-red-500 text-white';
    } else {
      return 'bg-gray-700 border-gray-600 text-gray-500';
    }
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const isHighScore = percentage >= 80;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isHighScore ? 'bg-green-600' : 'bg-yellow-600'
              }`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-gray-400 mb-6">Great job testing your slang knowledge!</p>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-lg text-gray-300 mb-2">
                {percentage}% Correct
              </div>
              <div className={`text-sm font-medium ${isHighScore ? 'text-green-400' : 'text-yellow-400'
                }`}>
                {isHighScore ? 'Excellent!' : 'Good effort!'}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Close Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Slang Quiz</h2>
              <p className="text-sm text-gray-400">Test your knowledge!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close quiz"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-400">
              Score: {score}/{currentQuestionIndex}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                '--progress-width': `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            What does "{currentQuestion.term}" mean?
          </h3>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${getAnswerClass(option)}`}
                disabled={showResult}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === option
                      ? 'border-current'
                      : 'border-gray-500'
                    }`}>
                    {showResult && option === currentQuestion.correctAnswer && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Definition Context */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Context:</p>
            <p className="text-gray-300 italic">"{currentQuestion.definition.example}"</p>
            {currentQuestion.definition.category && (
              <div className="mt-2">
                <CategoryBadge category={currentQuestion.definition.category} size="sm" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};