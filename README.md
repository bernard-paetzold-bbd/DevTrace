# DevTrace MCP Server

DevTrace is a Model Context Protocol (MCP) server designed to provide deep insights into your team's development activity, codebase, and project progress. It exposes a set of tools that allow both technical and less-technical team members (such as scrum masters, project managers, and BAs) to query and analyze repository data in a user-friendly, structured way.

DevTrace leverages any large language model (LLM) that supports the Model Context Protocol (MCP) to provide its server capabilities. This means you can use your existing LLM subscriptions (such as Anthorpic's Claude, Gitub Copilot, or others that support MCP) without needing to purchase additional services. You get all the advantages of DevTrace's insights and tools, seamlessly integrated with the LLM provider of your choice.

---

## Key Features & Use Cases

- **Track team progress on issues and pull requests**
- **Analyze individual or team contributions over time**
- **Get detailed commit, branch, and PR histories**
- **Estimate progress on open issues automatically**
- **Enable less technical users to ask high-level questions about the project**

---

## Available Tools

| Tool Name                 | Description                                                          | Example Use Case                                   |
| ------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| `get_repo_branches`       | List all branches in a repository.                                   | See all active branches for planning or review.    |
| `get_commits`             | Query commits by branch, author, file, or date.                      | Find out what was changed last week, or by whom.   |
| `compare_commits`         | Compare two branches or commits to see what changed.                 | Review work done in a sprint or feature branch.    |
| `get_commit_details`      | Get details and file changes for a specific commit.                  | Audit a particular change.                         |
| `analyze_author_work`     | Analyze what a specific person worked on in a time period or branch. | See a developer's contributions for a review.      |
| `get_pull_requests`       | List pull requests with filters (state, branch, etc).                | Track open, closed, or merged PRs.                 |
| `get_pull_request`        | Get details for a specific pull request by number.                   | Review the status and content of a PR.             |
| `get_issue`               | Get details for a specific issue by number.                          | Check the status or description of an issue.       |
| `get_issues`              | List issues with filters (state, labels, etc).                       | See all open bugs or tasks.                        |
| `estimate_issue_progress` | Estimate progress on an issue based on commits and activity.         | Quickly gauge how close an issue is to completion. |
| `get_branch_commits`      | Show commits unique to a feature branch (not in base branch).        | See what work is new in a feature branch.          |

---

## How Non-Technical Team Members Can Use DevTrace

DevTrace is designed to be accessible to all team members, not just developers. Here are some ways less technical users can leverage the server:

- **Sprint Reviews:** Instantly see what was accomplished in a sprint by comparing branches or listing recent PRs.
- **Progress Tracking:** Use `estimate_issue_progress` to get a percentage completion for any open issue, with detailed breakdowns.
- **Team Performance:** Use `analyze_author_work` to see individual or team contributions over time, helping with retrospectives or performance reviews.
- **Issue & PR Management:** Quickly list all open issues or PRs, filter by label or state, and drill into details without needing to use GitHub directly.
- **Transparency:** All queries return structured, markdown-formatted results that are easy to read and share in meetings or reports.

---

## Example Queries

- _"What did Alex work on last week?"_  
  → Use `analyze_author_work` with Alex's username and date range.
- _"How close is issue #42 to being done?"_  
  → Use `estimate_issue_progress` for issue 42.
- _"Show me all open pull requests for the release branch 1.1.0."_  
  → Use `get_pull_requests` with the branch filter.
- _"List all branches in the repo."_  
  → Use `get_repo_branches`.

---

## Getting Started

### VS Code

https://github.com/user-attachments/assets/7c8fa706-10a4-4069-bcf2-0bcb92b28514

- Open your Copilot window
- Click on the Configure tools button below the chat input
- Select Add MCP server in the top right
- Select stdio
- Enter "node" as the command to run
- Enter what you would like to name the server (dev-trace)
- Select "Global" or "Workspace" as desired
- Enter the path to the downloaded server files in the "args" field
- Add an "env" attribute as shown in the video and the example below
- Enter your github token to the "env" (ensure it has read permissions for the repositories you would like to query)
- Restart the server and open a new chat window
- Your new tools should now be available

```JSON
{
	"servers": {
		"dev-trace": {
			"type": "stdio",
			"command": "node",
			"args": [
				"C:\\Users\\bbdnet2817\\OneDrive - BBD Software Development\\Desktop\\dev-trace\\index.js"
			],
			"env": {
				"GITHUB_TOKEN": "your_token_here"
			}
		}
	},
	"inputs": []
}
```

---

## Integration

DevTrace can be integrated with any MCP-compatible client, chatbot, or automation tool. This allows you to:

- Ask questions in natural language (via a chat interface)
- Automate reporting and dashboards
- Enable self-service analytics for your team

---
