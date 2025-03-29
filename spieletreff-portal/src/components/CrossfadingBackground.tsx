import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CrossfadingBackgroundProps {
  images: string[];
  interval?: number; // Time each image is fully visible
  transitionDuration?: number; // Duration of the crossfade effect
  enabled?: boolean; // Toggle animation on/off
}

const CrossfadingBackground: React.FC<CrossfadingBackgroundProps> = ({
  images,
  interval = 7000, // Default to 7 seconds visible time
  transitionDuration = 1000, // Default to 1 second fade
  enabled = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const componentRef = useRef<HTMLDivElement>(null); // Ref for IntersectionObserver

  // Calculate the index of the next image
  const nextImageIndex = images.length > 0 ? (currentImageIndex + 1) % images.length : 0;

  // Cleanup function to clear all timers and reset state
  const cleanup = useCallback(() => {
    if (intervalTimerRef.current) {
      clearTimeout(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    // Reset transition state immediately on cleanup
    setIsTransitioning(false);
  }, []);

  // Function to start the next step in the animation cycle
  const scheduleNextTransition = useCallback(() => {
    if (!enabled || images.length < 2) return;

    cleanup(); // Clear previous timers before scheduling new ones

    // Timer for how long the current image stays fully visible
    intervalTimerRef.current = setTimeout(() => {
      setIsTransitioning(true); // Start the fade transition

      // Timer for the duration of the fade transition
      transitionTimerRef.current = setTimeout(() => {
        // After the transition completes:
        // Update the current image index to the next one
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        // Mark the transition as finished
        setIsTransitioning(false);
        // Schedule the *next* transition cycle
        scheduleNextTransition();
      }, transitionDuration);

    }, interval); // Wait for the interval duration before starting the fade

  }, [enabled, images.length, interval, transitionDuration, cleanup]);


  // Effect to manage animation based on visibility and enabled status
  useEffect(() => {
    const element = componentRef.current;
    if (!element || !enabled || images.length < 2) {
      cleanup(); // Stop animation if disabled, no images, or element not mounted
      return;
    }

    // Use IntersectionObserver if available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            // Start/resume animation when visible
            scheduleNextTransition();
          } else {
            // Pause animation when not visible
            cleanup();
          }
        },
        { threshold: 0.1 } // Trigger when 10% is visible
      );

      observer.observe(element);

      // Cleanup observer and timers on unmount or dependency change
      return () => {
        observer.unobserve(element);
        observer.disconnect();
        cleanup();
      };
    } else {
      // Fallback for browsers without IntersectionObserver: always animate
      scheduleNextTransition();
      return cleanup; // Cleanup timers on unmount
    }

  }, [enabled, images.length, scheduleNextTransition, cleanup]); // Re-run effect if enabled status or images change


  // Render null if no images are provided
  if (images.length === 0) return null;

  return (
    <div ref={componentRef} className="absolute inset-0 overflow-hidden">
      {/* Current Image Layer (fades out during transition) */}
      <div
        key={`img-${currentImageIndex}`} // Key helps React identify changes
        className="absolute inset-0 bg-cover bg-center transition-opacity ease-in-out"
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`,
          opacity: isTransitioning ? 0 : 1,
          transitionDuration: `${transitionDuration}ms`,
        }}
      >
        {/* Diagonal Mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-white from-10% via-white via-20% to-white/0"></div>
      </div>

      {/* Next Image Layer (fades in during transition) */}
      {images.length > 1 && ( // Only render if there's more than one image
        <div
          key={`img-${nextImageIndex}`} // Key helps React identify changes
          className="absolute inset-0 bg-cover bg-center transition-opacity ease-in-out"
          style={{
            backgroundImage: `url(${images[nextImageIndex]})`,
            opacity: isTransitioning ? 1 : 0,
            transitionDuration: `${transitionDuration}ms`,
          }}
        >
          {/* Diagonal Mask */}
          <div className="absolute inset-0 bg-gradient-to-r from-white from-10% via-white via-20% to-white/0"></div>
        </div>
      )}
    </div>
  );
};

export default CrossfadingBackground;
