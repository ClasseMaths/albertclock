import React, { useState, useEffect, useCallback } from 'react';
<style>
@import url('https://fonts.cdnfonts.com/css/lcd');
</style>
// --- Styles ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#222',
    color: 'rgb(0 255 208)',
    fontFamily: '"LCD Com", sans-serif',
    transition: 'background-color 0.5s ease',
  },
  clockFace: {
    display: 'flex',
    flexDirection: 'column', // Stack on mobile
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    '@media (minWidth: 768px)': {
      flexDirection: 'row',
    },
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '900px',
  },
  equation: {
    fontSize: '12rem',
    textAlign: 'center',
    height: '12rem', // Fixed height to prevent jumping
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: 'rgb(34 201 184) 0px 0px 10px',
  },
  label: {
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2rem',
    opacity: 0.6,
    marginTop: '1rem',
  },
  controls: {
    marginTop: '3rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '1rem 2rem',
    borderRadius: '50px',
  },
  button: (active) => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    backgroundColor: active ? '#fff' : 'transparent',
    color: active ? '#222' : '#fff',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  }),
  separator: {
    fontSize: '2rem',
    animation: 'blink 1s infinite',
  },
  solution: {
    marginTop: '1rem',
    fontSize: '1.2rem',
    color: '#4caf50',
    minHeight: '1.5rem',
  }
};

// --- Math Logic ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEquation = (target, level) => {
  // Level 1: Addition (a + b)
  if (level === 1) {
    const a = getRandomInt(0, target);
    const b = target - a;
    return `${a} + ${b}`;
  }

  // Level 2: Subtraction (a - b)
  if (level === 2) {
    const b = getRandomInt(1, 9); // keep numbers relatively simple
    const a = target + b;
    return `${a} - ${b}`;
  }

  // Level 3: Multiplication & Division (or fallback to sub)
  if (level === 3) {
    const type = Math.random() > 0.5 ? 'mult' : 'div';
    
    if (type === 'mult') {
      // Find factors
      const factors = [];
      for(let i=1; i<=target; i++) {
        if (target % i === 0) factors.push(i);
      }
      if (factors.length > 2) { // Has factors other than 1 and itself
        const a = factors[getRandomInt(1, factors.length - 2)]; // avoid 1 and target
        const b = target / a;
        return `${a} × ${b}`;
      }
    } else {
      // Division: target = a / b -> a = target * b
      const b = getRandomInt(2, 5);
      const a = target * b;
      return `${a} ÷ ${b}`;
    }
    // Fallback if prime or difficult
    return generateEquation(target, 2);
  }

  // Level 4: Mixed complex (a + b - c)
  if (level === 4) {
    const c = getRandomInt(1, 10);
    const intermediate = target + c; // a + b = intermediate
    const a = getRandomInt(0, intermediate);
    const b = intermediate - a;
    return `${a} + ${b} - ${c}`;
  }

  // Level 5: Advanced Multiplications & Divisions
  if (level === 5) {
  }
      // Level 5: Advanced Multiplications & Divisions
  if (level === 6) {
  }

  return target;
};

// --- Time Utility Functions ---
const fetchParisTime = async () => {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Paris');
    if (!response.ok) throw new Error('Failed to fetch time');
    const data = await response.json();
    return new Date(data.datetime);
  } catch (error) {
    console.error('Error fetching Paris time:', error);
    // Fallback to local time with timezone conversion
    const now = new Date();
    return new Date(now.toLocaleString("fr-FR", {timeZone: "Europe/Paris"}));
  }
};

const getParisTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString("fr-FR", {timeZone: "Europe/Paris"}));
};

const getParisHours = (date) => {
  return date.getHours();
};

const getParisMinutes = (date) => {
  return date.getMinutes();
};

// --- Main Component ---
const AlbertClock = () => {
  const [time, setTime] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [equations, setEquations] = useState({ 
    h: '?', 
    m: '?' 
  });
  
  // Keep track of the values we currently display to avoid regenerating on every second tick
  const [displayedValues, setDisplayedValues] = useState({
    h: null,
    m: null
  });

  const updateEquations = useCallback((newDate, level) => {
    if (!newDate) return;
    
    const currentH = getParisHours(newDate);
    const currentM = getParisMinutes(newDate);

    setDisplayedValues(prev => {
      let newEqs = { ...equations };
      let changed = false;

      // Only regenerate hour equation if hour changed or difficulty changed
      if (prev.h !== currentH || level !== difficulty) {
        newEqs.h = generateEquation(currentH, level);
        changed = true;
      }

      // Only regenerate minute equation if minute changed or difficulty changed
      if (prev.m !== currentM || level !== difficulty) {
        newEqs.m = generateEquation(currentM, level);
        changed = true;
      }

      if (changed) setEquations(newEqs);
      
      return { h: currentH, m: currentM };
    });
  }, [difficulty, equations]);

  // Initialize time from server on mount
  useEffect(() => {
    fetchParisTime().then(date => {
      setTime(date);
      updateEquations(date, difficulty);
    });
  }, []);

  // Tick the clock
  useEffect(() => {
    const timer = setInterval(() => {
      fetchParisTime().then(date => {
        setTime(date);
        updateEquations(date, difficulty);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, updateEquations]);

  // Handle difficulty change immediately
  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    if (time) {
      // Force regeneration
      setEquations({
        h: generateEquation(getParisHours(time), level),
        m: generateEquation(getParisMinutes(time), level)
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* CSS for blinking animation */}
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          @media (maxWidth: 768px) {
            .clock-face { flex-direction: column; }
            .separator { display: none; }
          }
        `}
      </style>

      <div style={styles.clockFace} className="clock-face">
        {/* Hours */}
        <div style={styles.block}>
          <div style={styles.label}>Heures</div>
          <div style={styles.equation}>
            {equations.h}
          </div>
        </div>

        {/* Separator */}
        <div style={styles.separator} className="separator">:</div>

        {/* Minutes */}
        <div style={styles.block}>
          <div style={styles.label}>Minutes</div>
          <div style={styles.equation}>
            {equations.m}
          </div>
        </div>
      </div>

      {/* Actual Time (Solution) 
      <div style={styles.solution}>
        Solution: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      */}

      {/* Difficulty Controls */}
      <div style={styles.controls}>
        <span style={{ marginRight: '10px', fontSize: '0.8rem', opacity: 0.8 }}>LEVEL:</span>
        {[0,1, 2, 3, 4].map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultyChange(level)}
            style={styles.button(difficulty === level)}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlbertClock;
