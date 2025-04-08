#My Domain name: hassan-adelani.tech

# GitHub Profile Fetcher

A web application that allows users to search for GitHub profiles and view their information and repositories.

## Features

- Search for GitHub users by username
- View user profile information (avatar, name, bio, followers, etc.)
- See a list of the user's most recently updated repositories
- Responsive design that works on desktop and mobile
- Dark/Light mode toggle
- Real-time loading indicators and error handling

## Technologies Used

- HTML5, CSS3, and JavaScript
- GitHub REST API

## Local Setup

1. Clone this repository:
   ```
   git clone https://github.com/Hassan-Adelani-Luqman/github-profile-fetcher.git
   cd github-profile-fetcher
   ```

2. Open the `index.html` file in your browser:
   ```
   open index.html  # For macOS
   # OR
   start index.html  # For Windows
   ```

3. Start searching GitHub usernames!

## API Usage

This application uses the GitHub REST API to fetch user data. The API endpoints used are:

- `https://api.github.com/users/{username}` - Get user profile information
- `https://api.github.com/users/{username}/repos` - Get user repositories

GitHub API has a rate limit of 60 requests per hour for unauthenticated requests. For more information, visit the [GitHub API documentation](https://docs.github.com/en/rest).
