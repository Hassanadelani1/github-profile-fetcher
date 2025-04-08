#The link to the Demo video: https://vimeo.com/1070686172/474dbebe95?share=copy

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
- Load balancing with Nginx

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

## Server Deployment

### Web Server Setup (Web01 and Web02)

1. Install a web server (Nginx) on both Web01 and Web02:
   ```
   sudo apt update
   sudo apt install nginx
   ```

2. Copy application files to the web server directory:
   ```
   sudo cp -r /path/to/github-profile-fetcher/* /var/www/html/
   ```

3. Configure Nginx by editing `/etc/nginx/sites-available/default`:
   ```
   server {
       listen 80;
       server_name _;
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

4. Restart Nginx:
   ```
   sudo systemctl restart nginx
   ```

### Load Balancer Setup (Lb01)

1. Install Nginx on Lb01:
   ```
   sudo apt update
   sudo apt install nginx
   ```

2. Configure Nginx as a load balancer by editing `/etc/nginx/sites-available/default`:
   ```
   upstream backend {
       server web01_ip_address;
       server web02_ip_address;
   }
   
   server {
       listen 80;
       server_name _;
       
       location / {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Restart Nginx:
   ```
   sudo systemctl restart nginx
   ```

## Load Balancing Strategy

The load balancer is configured to use the round-robin algorithm, which distributes incoming requests evenly across both web servers (Web01 and Web02). This approach ensures:

- Even distribution of traffic
- Improved reliability (if one server goes down, the other continues to serve requests)
- Better performance under high load

## Challenges and Solutions

### Challenge 1: Varifying the autheticity
**Solution**: Read the GitHub API documentation in depth

### Challenge 1: GitHub API Rate Limiting

**Problem**: GitHub API limits unauthenticated requests to 60 per hour per IP address.

**Solution**: Implemented caching of API responses in localStorage to reduce the number of API calls for repeated searches. For a production application, using a GitHub token or OAuth would be recommended.

### Challenge 2: Cross-Origin Resource Sharing (CORS)

**Problem**: Browsers enforce security restrictions when making requests to different domains.

**Solution**: GitHub API supports CORS by default, so we didn't need to implement any proxy. For APIs that don't support CORS, a backend proxy would be needed.

### Challenge 3: Load Balancer Health Checks

**Problem**: Ensuring that traffic is only routed to healthy web servers.

**Solution**: Configured Nginx health checks in the load balancer to regularly ping the web servers and automatically remove unhealthy servers from the rotation.

## Future Improvements

- Add authentication with GitHub OAuth for higher API rate limits
- Implement pagination for users with many repositories
- Add more detailed repository information
- Create a backend caching layer to improve performance
- Add more filtering and sorting options for repositories

## Credits

- [GitHub REST API](https://docs.github.com/en/rest)
- [Nginx Documentation](https://nginx.org/en/docs/)
- Icons from [Heroicons](https://heroicons.com/)

## License

This project is licensed under the WTFPL License.
