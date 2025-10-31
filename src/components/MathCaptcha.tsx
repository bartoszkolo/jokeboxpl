import { useState, useEffect } from 'react'

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void
  onReset?: () => void
}

export function MathCaptcha({ onVerify, onReset }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [operator, setOperator] = useState('+')
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  const generateNewCaptcha = () => {
    const operations = ['+', '-']
    const selectedOperator = operations[Math.floor(Math.random() * operations.length)]
    let a = Math.floor(Math.random() * 10) + 1
    let b = Math.floor(Math.random() * 10) + 1

    // Ensure subtraction doesn't result in negative numbers
    if (selectedOperator === '-' && a < b) {
      [a, b] = [b, a]
    }

    setNum1(a)
    setNum2(b)
    setOperator(selectedOperator)

    let answer = 0
    if (selectedOperator === '+') {
      answer = a + b
    } else {
      answer = a - b
    }

    setCorrectAnswer(answer)
    setUserAnswer('')
    setIsVerified(false)
    setError('')
    onVerify(false)
  }

  useEffect(() => {
    generateNewCaptcha()
  }, [])

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserAnswer(value)

    if (value === '') {
      setError('')
      setIsVerified(false)
      onVerify(false)
      return
    }

    const numValue = parseInt(value)
    if (isNaN(numValue)) {
      setError('Wpisz liczbę')
      setIsVerified(false)
      onVerify(false)
      return
    }

    if (numValue === correctAnswer) {
      setError('')
      setIsVerified(true)
      onVerify(true)
    } else {
      setError('Błędna odpowiedź')
      setIsVerified(false)
      onVerify(false)
    }
  }

  const handleRefresh = () => {
    generateNewCaptcha()
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Potwierdź, że nie jesteś robotem
        </label>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Odśwież captchę"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="bg-white px-4 py-2 rounded border border-gray-300 font-mono text-lg">
          {num1} {operator} {num2} = ?
        </div>

        <input
          type="text"
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="Odpowiedź"
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : isVerified
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300'
          }`}
        />

        {isVerified && (
          <div className="text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {error && !isVerified && userAnswer !== '' && (
          <div className="text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {error && userAnswer !== '' && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {isVerified && (
        <p className="mt-2 text-sm text-green-600">Poprawna odpowiedź!</p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Rozwiąż proste działanie matematyczne, aby udowodnić, że jesteś człowiekiem
      </p>
    </div>
  )
}