document.addEventListener("DOMContentLoaded", () => {
  initScrollSpy();
  initSpotifyWidget();
  initWritingProgress();
});

function initScrollSpy() {
  const sections = document.querySelectorAll(".section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  if (!sections.length || !("IntersectionObserver" in window)) {
    if (navLinks[0]) navLinks[0].classList.add("active");
    return;
  }

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length > 0) {
      setActive(visible[0].target.id);
    }
  }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });

  sections.forEach(section => observer.observe(section));
  setActive(sections[0].id);
}

function toggleProject(projectId) {
  const content = document.getElementById(projectId + '-content');
  content.classList.toggle('active');
}

function showTab(event, projectId, tabName) {
  const tabContents = document.querySelectorAll(`#${projectId}-content .tab-content`);
  tabContents.forEach(content => content.classList.remove('active'));

  const tabButtons = document.querySelectorAll(`#${projectId}-content .tab-button`);
  tabButtons.forEach(button => button.classList.remove('active'));

  document.getElementById(`${projectId}-${tabName}`).classList.add('active');
  event.target.classList.add('active');
}

function initSpotifyWidget() {
  const setDefaultState = () => {
    const albumImg = document.getElementById("spotify-album");
    const trackText = document.getElementById("spotify-track");
    const artistText = document.getElementById("spotify-artist");
    const progressBar = document.getElementById("spotify-progress");

    if (trackText) trackText.textContent = "Nothing playing";
    if (artistText) artistText.textContent = "";
    if (albumImg) albumImg.src = "unnamed.jpg";
    if (progressBar) progressBar.style.width = "0%";
  };

  setDefaultState();

  async function updateSpotify() {
    try {
      const res = await fetch("https://api.joelalexander.dev/spotify/current");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const albumImg = document.getElementById("spotify-album");
      const trackText = document.getElementById("spotify-track");
      const artistText = document.getElementById("spotify-artist");
      const progressBar = document.getElementById("spotify-progress");

      if (data && data.track) {
        if (albumImg) {
          albumImg.src = data.albumArt || "unnamed.jpg";
          albumImg.alt = `${data.album} by ${data.artist}`;
        }
        if (trackText) {
          trackText.textContent = data.track;
        }
        if (artistText) {
          artistText.textContent = data.artist;
        }
        if (progressBar) {
          const progressPercent = (data.progress_ms / data.duration_ms) * 100;
          progressBar.style.width = progressPercent + "%";
        }
      } else {
        setDefaultState();
      }
    } catch (err) {
      setDefaultState();
    }
  }

  updateSpotify();
  setInterval(updateSpotify, 10000);
}

function initWritingProgress() {
  const WORD_GOAL = 5000;

  async function updateWritingProgress() {
    try {
      const res = await fetch("https://api.joelalexander.dev/docs/info");
      const data = await res.json();

      if (!data) return;

      const wordCountElement = document.querySelector('.word-count .count');
      if (wordCountElement) {
        wordCountElement.textContent = data.wordCount.toLocaleString();
      }

      const projectStatsWordCount = document.querySelector('.project-stats span');
      if (projectStatsWordCount) {
        projectStatsWordCount.textContent = `${data.wordCount.toLocaleString()} words`;
      }

      const progressPercent = Math.min(100, Math.round((data.wordCount / WORD_GOAL) * 100));

      const overviewParagraphs = document.querySelectorAll('#destruction-overview p');
      overviewParagraphs.forEach(p => {
        if (p.innerHTML.includes('Progress:')) {
          p.innerHTML = `<strong>Progress:</strong> ${progressPercent}% complete (${data.wordCount.toLocaleString()} / ${WORD_GOAL.toLocaleString()} words)`;
        }
      });

      const progressBar = document.querySelector('#destruction-overview .progress-fill');
      if (progressBar) {
        progressBar.style.width = progressPercent + "%";
      }
    } catch (err) {
      console.error("Writing progress fetch error:", err);
    }
  }

  updateWritingProgress();
  setInterval(updateWritingProgress, 30000);
}
