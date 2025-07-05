# Maakaf Home Backend

A NestJS-based backend service that analyzes GitHub user activity to assess open source contributions, engagement, and project involvement. This service is part of the broader **Maakaf Home** initiative - the website for [Maakaf](https://maakaf.com), an Israeli open source community.

## Purpose

This service provides detailed analysis of GitHub user activity over the past 6 months, including:
- **Commits**: Code contributions to repositories
- **Pull Requests**: Feature contributions and bug fixes
- **Issues**: Problem reporting and feature requests
- **Comments**: Engagement on PRs and issues

## Features

- 🔍 **Activity Analysis**: Tracks commits, PRs, issues, and comments from the last 6 months
- 📊 **Repository Filtering**: Only analyzes repositories with more than 3 forks (indicating community interest)
- 🎯 **User-Specific Data**: Filters activity by specific GitHub usernames
- 📝 **Comprehensive Logging**: Winston-based logging with file output
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Input Validation**: Class-validator based request validation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **API**: GitHub GraphQL API
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Validation**: class-validator

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub Personal Access Token

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maakaf_home_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "GITHUB_TOKEN=your_github_token_here" > .env
   ```

## GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with the following scopes:
   - `public_repo` (for public repository access)
   - `read:user` (for user information)
3. Copy the token and add it to your `.env` file

## Running the Application

### Development Mode
```bash
# Unix/Linux/macOS
npm run start:dev:unix

# Windows
npm run start:dev:win

# Cross-platform
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, you can access the Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api

## API Usage

### Endpoint: `POST /github`

Analyzes GitHub activity for the provided usernames.

**Request Body:**
```json
{
  "usernames": ["octocat", "torvalds", "your-username"]
}
```

**Response:**
```json
[
  {
    "username": "octocat",
    "repos": [
      {
        "repoName": "Hello-World",
        "description": "My first repository on GitHub!",
        "url": "https://github.com/octocat/Hello-World",
        "commits": 5,
        "pullRequests": 2,
        "issues": 1,
        "prComments": 3,
        "issueComments": 2
      }
    ],
    "summary": {
      "totalCommits": 5,
      "totalPRs": 2,
      "totalIssues": 1,
      "totalPRComments": 3,
      "totalIssueComments": 2
    }
  }
]
```

### Error Handling

The API returns appropriate error responses:
- `400 Bad Request`: Missing or invalid GitHub token
- `500 Internal Server Error`: GitHub API errors or processing failures

## Rate Limiting

The service uses GitHub's GraphQL API which has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

The service includes error handling for rate limit exceeded scenarios.

## Logging

Logs are written to `logs/app.log` with the following levels:
- `debug`: Detailed GraphQL responses and processing information
- `warn`: Repository processing errors
- `error`: User processing errors and API failures

## Development

### Project Structure
```
src/
├── main.ts                 # Application entry point
├── github.controller.ts    # API endpoints
├── github-activity.service.ts  # GitHub API integration
├── github.dto.ts          # Request/response DTOs
└── logger.ts              # Winston logger configuration
```

### Available Scripts

- `npm run start:dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests (not implemented yet)

## Contributing

We welcome contributions from the community! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on:

- **Documentation**: Improving README, API docs, or code comments
- **Bug Fixes**: Reporting and fixing issues
- **Feature Suggestions**: Proposing new features or improvements

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Contact the Maakaf community through [maakaf.com](https://maakaf.com)

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [GitHub GraphQL API](https://docs.github.com/en/graphql)
- Part of the [Maakaf](https://maakaf.com) open source community initiative 