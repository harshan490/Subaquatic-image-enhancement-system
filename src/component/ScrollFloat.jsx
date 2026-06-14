import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({
  children,
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Split text into characters
    const text = children;
    const container = containerRef.current;
    container.innerHTML = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      container.appendChild(span);
      charsRef.current[index] = span;
    });

    // Animate characters on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: scrollStart,
        end: scrollEnd,
        scrub: 1,
        markers: false,
      },
    });

    charsRef.current.forEach((char, index) => {
      tl.from(
        char,
        {
          opacity: 0,
          y: 50,
          duration: animationDuration,
          ease: ease,
        },
        index * stagger
      );
    });

    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, [children, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <div className="scroll-float">
      <div className="scroll-float-text" ref={containerRef}>
        {children}
      </div>
    </div>
  );
}
