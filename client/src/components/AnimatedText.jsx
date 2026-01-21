import { useEffect, useState } from 'react'

export function TypewriterText({ text, speed = 50, className = '' }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return <span className={className}>{displayedText}</span>
}

export function FadeInText({ text, delay = 0, className = '', children }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <span
      className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {text || children}
    </span>
  )
}

export function GradientText({ text, className = '' }) {
  return (
    <span className={`bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient ${className}`}>
      {text}
    </span>
  )
}

export function SplitText({ text, delay = 0.1, className = '' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  // Force white color to ensure visibility
  return (
    <span 
      className={className || 'text-white'} 
      style={{ 
        color: '#ffffff',
        display: 'inline-block',
        fontWeight: 'bold'
      }}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-500 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ 
            transitionDelay: `${index * 0.05}s`,
            color: '#ffffff'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
