document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");

  function showSection(hash) {
    sections.forEach(sec => {
      if (hash === "#" + sec.id || (hash === "" && sec.id === "home")) {
        sec.style.display = "block";
        sec.style.opacity = "0";
        setTimeout(() => {
          sec.style.transition = "opacity 0.3s ease";
          sec.style.opacity = "1";
        }, 10);
      } else {
        sec.style.display = "none";
      }
    });
    updateActiveNav(hash);
  }

  showSection(window.location.hash);

  window.addEventListener("hashchange", () => {
    showSection(window.location.hash);
  });

  const projectTiles = document.querySelectorAll('.project-tile');
  projectTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      tile.style.transform = 'scale(0.95)';
      setTimeout(() => {
        tile.style.transform = 'translateY(-3px)';
      }, 100);
    });
  });

  initSpotifyWidget();
  initWritingProgress();
});

function updateActiveNav(hash) {
  document.querySelectorAll('.navbar a').forEach(link => {
    link.classList.remove('active');
  });

  const currentHash = hash || '#home';
  const activeLink = document.querySelector(`.navbar a[href="${currentHash}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
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
    
    if (trackText) trackText.textContent = "Nothing Playing";
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
  async function updateWritingProgress() {
    try {
      const res = await fetch("https://api.joelalexander.dev/docs/info");
      const data = await res.json();

      if (data) {
        const wordCountElement = document.querySelector('.word-count .count');
        if (wordCountElement) {
          wordCountElement.textContent = data.wordCount.toLocaleString();
        }

        const projectStatsWordCount = document.querySelector('.project-stats span');
        if (projectStatsWordCount) {
          projectStatsWordCount.innerHTML = `📖 ${data.wordCount.toLocaleString()} words`;
        }

        const projectTitleWordCount = document.querySelector('.project-header h2');
        if (projectTitleWordCount && projectTitleWordCount.textContent.includes('0')) {
          projectTitleWordCount.innerHTML = projectTitleWordCount.innerHTML.replace('0', data.wordCount.toLocaleString());
        }

        const overviewWordCount = document.querySelector('#bloodstained-honor-overview p:nth-of-type(2)');
        if (overviewWordCount && overviewWordCount.innerHTML.includes('0')) {
          const progressPercent = Math.round((data.wordCount / 800000) * 100);
          overviewWordCount.innerHTML = `<strong>Progress:</strong> ${progressPercent}% complete (${data.wordCount.toLocaleString()} / 80,000 words)`;
        }

        const allOverviewParagraphs = document.querySelectorAll('#bloodstained-honor-overview p');
        
        allOverviewParagraphs.forEach(p => {
          if (p.innerHTML.includes('Progress:')) {
            const progressPercent = Math.round((data.wordCount / 800000) * 100);
            p.innerHTML = `<strong>Progress:</strong> ${progressPercent}% complete (${data.wordCount.toLocaleString()} / 80,000 words)`;
          }
          
          if (p.innerHTML.includes('Current Chapter:')) {
            p.innerHTML = `<strong>Current Chapter:</strong> Chapter ${data.chapterNum} - "${data.title}"`;
          }
          
          if (p.innerHTML.includes('Recent Milestone:')) {
            p.innerHTML = `<strong>Recent Milestone:</strong> Completed Chapter ${data.chapterNum - 1}, working on Chapter ${data.chapterWord} - "${data.title}".`;
          }
        });

        const progressBar = document.querySelector('#bloodstained-honor-overview .progress-fill');
        if (progressBar) {
          const progressPercent = Math.round((data.wordCount / 800000) * 100);
          progressBar.style.width = progressPercent + "%";
        }
      }
    } catch (err) {
      console.error("Writing progress fetch error:", err);
    }
  }

  updateWritingProgress();
  setInterval(updateWritingProgress, 30000);
}