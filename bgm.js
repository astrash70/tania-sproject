(function() {
  // === Background Music Controller ===
  // Uses localStorage to persist audio state across pages.
  // Exposes bgmPause() and bgmResume() for story-viewer.html to control on slide 4.

  const audio = new Audio("audio.mp3");
  const storageKey_time = 'bgmTime';
  const storageKey_shouldPlay = 'bgmMustPlay';

  let audio = null;
  let isPausedBySlide4 = false;
  let saveInterval = null;

  // --- Create audio element ---
  function createAudio() {
    const el = document.createElement('audio');
    el.loop = true;
    el.preload = 'auto';
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }

  // --- Resume from saved position if needed ---
  function init() {
    audio = createAudio();
    audio.src = audioSrc;

    const savedTime = parseFloat(localStorage.getItem(storageKey_time)) || 0;
    const shouldPlay = localStorage.getItem(storageKey_shouldPlay) === 'true';

    if (savedTime > 0) {
      audio.currentTime = savedTime;
    }

    if (shouldPlay) {
      audio.play().catch(function() {
        // Autoplay may be blocked; we try again on user interaction
      });
    }

    // Save current time periodically
    saveInterval = setInterval(saveState, 1000);

    // Save on page unload
    window.addEventListener('beforeunload', saveAndPersist);
    window.addEventListener('pagehide', saveAndPersist);
  }

  function saveState() {
    if (audio && !audio.paused && !audio.ended) {
      localStorage.setItem(storageKey_time, audio.currentTime);
    }
  }

  function saveAndPersist() {
    if (audio) {
      localStorage.setItem(storageKey_time, audio.currentTime);
    }
    // Ensure next page will play
    localStorage.setItem(storageKey_shouldPlay, 'true');
  }

  // --- Public API for story-viewer.html ---

  // --- Public API for graduation-landing.html to trigger play on START button ---
  window.bgmStart = function() {
    localStorage.setItem(storageKey_shouldPlay, 'true');
    if (audio && audio.paused) {
      audio.play().catch(function() {});
    }
  };

  window.bgmPause = function() {
    if (audio && !audio.paused) {
      audio.pause();
      saveState();
      isPausedBySlide4 = true;
    }
  };

  window.bgmResume = function() {
    if (audio && audio.paused && isPausedBySlide4) {
      audio.play().catch(function() {});
      isPausedBySlide4 = false;
    }
  };

  // Also persist on next-page navigation clicks
  document.addEventListener('click', function(e) {
    // If a link or button causes navigation, save time
    if (e.target.closest('a') || e.target.closest('button') ||
        e.target.closest('.nav-arrow') || e.target.closest('.touch-zone') ||
        e.target.closest('.dot')) {
      saveState();
      localStorage.setItem(storageKey_shouldPlay, 'true');
    }
  });

  // Start
  init();
})();
