// DOM elements
const usernameInput = document.getElementById("username-input");
const searchButton = document.getElementById("search-button");
const profileSection = document.getElementById("profile-section");
const reposSection = document.getElementById("repos-section");
const errorMessage = document.getElementById("error-message");
const loadingContainer = document.getElementById("loading-container");
const themeToggle = document.getElementById("theme-toggle");

// GitHub API base URL
const API_BASE_URL = "https://api.github.com";

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  updateThemeIcon();
});

function updateThemeIcon() {
  const isDarkMode = !document.body.classList.contains("light-mode");
  themeToggle.innerHTML = isDarkMode
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
}

// Handle search for GitHub user
searchButton.addEventListener("click", searchUser);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchUser();
  }
});

function searchUser() {
  const username = usernameInput.value.trim();
  if (!username) return;

  // Reset previous results
  profileSection.innerHTML = "";
  reposSection.innerHTML = "";
  profileSection.classList.remove("visible");
  reposSection.classList.remove("visible");
  errorMessage.style.display = "none";

  // Show loading state
  loadingContainer.style.display = "block";

  // Fetch user data
  fetchUserData(username);
}

async function fetchUserData(username) {
  try {
    // Fetch user profile
    const userResponse = await fetch(`${API_BASE_URL}/users/${username}`);

    if (!userResponse.ok) {
      // Specific error handling based on status
      switch (userResponse.status) {
        case 404:
          throw new Error("User not found");
        case 403:
          throw new Error("API rate limit exceeded");
        case 500:
        case 502:
        case 503:
          throw new Error("GitHub API is currently unavailable");
        default:
          throw new Error(`GitHub API error: ${userResponse.status}`);
      }
    }

    const userData = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(
      `${API_BASE_URL}/users/${username}/repos?sort=updated&per_page=12`
    );

    if (!reposResponse.ok) {
      throw new Error(`Repositories fetch error: ${reposResponse.status}`);
    }

    const reposData = await reposResponse.json();

    // Hide loading state
    loadingContainer.style.display = "none";

    // Display the data
    displayUserProfile(userData);
    displayUserRepos(reposData);
  } catch (error) {
    // Hide loading state
    loadingContainer.style.display = "none";

    // Detailed error handling
    let errorMsg = "An unexpected error occurred";
    if (error.message) {
      switch (error.message) {
        case "User not found":
          errorMsg = "User not found. Please check the username and try again.";
          break;
        case "API rate limit exceeded":
          errorMsg = "GitHub API rate limit exceeded. Please try again later.";
          break;
        case "GitHub API is currently unavailable":
          errorMsg =
            "GitHub services are currently unavailable. Please try again later.";
          break;
        default:
          errorMsg = error.message;
      }
    }

    // Show error message
    errorMessage.textContent = errorMsg;
    errorMessage.style.display = "block";
    console.error("Error fetching data:", error);
  }
}

function displayUserProfile(user) {
  const profileHTML = `
                <div class="profile-card">
                    <img src="${user.avatar_url}" alt="${
    user.login
  }" class="profile-image">
                    <h2 class="profile-name">${user.name || user.login}</h2>
                    <p class="profile-username">@${user.login}</p>
                    <p class="profile-bio">${user.bio || "No bio available"}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">${user.public_repos}</span>
                            <span class="stat-label">Repositories</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${user.followers}</span>
                            <span class="stat-label">Followers</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${user.following}</span>
                            <span class="stat-label">Following</span>
                        </div>
                    </div>
                </div>
            `;

  profileSection.innerHTML = profileHTML;
  setTimeout(() => profileSection.classList.add("visible"), 100);
}

function displayUserRepos(repos) {
  if (repos.length === 0) {
    reposSection.innerHTML = `
                    <div class="repos-header">
                        <h2>Recent Repositories</h2>
                    </div>
                    <p class="no-repos-message">No repositories found</p>
                `;
    setTimeout(() => reposSection.classList.add("visible"), 100);
    return;
  }

  // Create filter and sort controls
  const filterHTML = `
                <div class="repos-header">
                    <h2>Recent Repositories</h2>
                </div>
                <div class="repos-filter-container">
                    <div>
                        <label class="filter-label">Language:</label>
                        <select id="language-filter" class="repos-filter">
                            <option value="">All Languages</option>
                            ${getUniqueLanguages(repos)
                              .map(
                                (lang) => `
                                <option value="${lang}">${lang}</option>
                            `
                              )
                              .join("")}
                        </select>
                    </div>
                    <div>
                        <label class="filter-label">Sort by:</label>
                        <select id="sort-repos" class="repos-filter">
                            <option value="updated">Recently Updated</option>
                            <option value="stars">Most Starred</option>
                            <option value="forks">Most Forked</option>
                        </select>
                    </div>
                </div>
                <div id="filtered-repos-container" class="repos-container">
                    ${renderReposHTML(repos)}
                </div>
            `;

  reposSection.innerHTML = filterHTML;

  // Add event listeners for filtering and sorting
  const languageFilter = document.getElementById("language-filter");
  const sortRepos = document.getElementById("sort-repos");
  const filteredReposContainer = document.getElementById(
    "filtered-repos-container"
  );

  function updateReposDisplay() {
    const filteredRepos = filterAndSortRepos(
      repos,
      languageFilter.value,
      sortRepos.value
    );

    filteredReposContainer.innerHTML = renderReposHTML(filteredRepos);

    // Show no repos message if filtered list is empty
    if (filteredRepos.length === 0) {
      filteredReposContainer.innerHTML = `
                        <p class="no-repos-message">No repositories match the current filter</p>
                    `;
    }
  }

  languageFilter.addEventListener("change", updateReposDisplay);
  sortRepos.addEventListener("change", updateReposDisplay);

  setTimeout(() => reposSection.classList.add("visible"), 200);
}

// Function to get unique languages
function getUniqueLanguages(repos) {
  const languages = repos
    .map((repo) => repo.language)
    .filter((lang) => lang !== null);
  return [...new Set(languages)];
}

// Function to filter and sort repositories
function filterAndSortRepos(repos, language, sortBy) {
  let filteredRepos = [...repos];

  // Filter by language
  if (language) {
    filteredRepos = filteredRepos.filter((repo) => repo.language === language);
  }

  // Sort repositories
  switch (sortBy) {
    case "stars":
      filteredRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      break;
    case "forks":
      filteredRepos.sort((a, b) => b.forks_count - a.forks_count);
      break;
    case "updated":
    default:
      filteredRepos.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
  }

  return filteredRepos;
}

// Function to render repos HTML
function renderReposHTML(repos) {
  return repos
    .map(
      (repo) => `
                <div class="repo-card">
                    <a href="${
                      repo.html_url
                    }" class="repo-name" target="_blank">${repo.name}</a>
                    <p class="repo-description">${
                      repo.description || "No description available"
                    }</p>
                    <div class="repo-stats">
                        <span class="repo-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
                            </svg>
                            ${repo.stargazers_count}
                        </span>
                        <span class="repo-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                            </svg>
                            ${repo.forks_count}
                        </span>
                        ${
                          repo.language
                            ? `
                            <span class="repo-stat">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${getLanguageColor(
                                  repo.language
                                )}; margin-right: 4px;"></span>
                                ${repo.language}
                            </span>
                        `
                            : ""
                        }
                    </div>
                </div>
            `
    )
    .join("");
}

// Function to get language color
function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    "C#": "#178600",
    PHP: "#4F5D95",
    Go: "#00ADD8",
    Ruby: "#701516",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Rust: "#dea584",
    "C++": "#f34b7d",
    C: "#555555",
  };

  return colors[language] || "#6E40C9";
}

// Initialize theme based on user preference
function initTheme() {
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (!prefersDarkMode) {
    document.body.classList.add("light-mode");
  }
  updateThemeIcon();
}

initTheme();
