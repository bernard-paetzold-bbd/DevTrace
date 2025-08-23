export function listTools() {
	return {
		tools: [
			{
				name: 'get_repo_branches',
				description: 'Query the list of branches in a GitHub repository',
				inputSchema: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							description: 'Repository url to query'
						}
					},
					required: ['url']
				}
			},
			{
				name: 'get_commits',
				description:
					'Get commits for a repository with flexible query parameters (branch, file, author, committer, date, etc.)',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						sha: {
							type: 'string',
							description: 'SHA or branch to start listing commits from'
						},
						path: {
							type: 'string',
							description:
								'Only commits containing this file path will be returned'
						},
						author: {
							type: 'string',
							description:
								'GitHub username or email address to use to filter by commit author'
						},
						committer: {
							type: 'string',
							description:
								'GitHub username or email address to use to filter by commit committer'
						},
						since: {
							type: 'string',
							description: 'Only show results after this ISO 8601 timestamp'
						},
						until: {
							type: 'string',
							description: 'Only show results before this ISO 8601 timestamp'
						},
						per_page: {
							type: 'number',
							description: 'Number of results per page (max 100)'
						},
						page: {
							type: 'number',
							description: 'Page number of results to fetch'
						}
					},
					required: ['url']
				}
			},
			{
				name: 'compare_commits',
				description:
					'Compare two commits or branches to see what changed between them. Great for understanding work done in a period.',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						base: {
							type: 'string',
							description: 'Base branch or commit SHA to compare from'
						},
						head: {
							type: 'string',
							description: 'Head branch or commit SHA to compare to'
						}
					},
					required: ['url', 'base', 'head']
				}
			},
			{
				name: 'get_commit_details',
				description:
					'Get detailed information about a specific commit including all file changes',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						sha: {
							type: 'string',
							description: 'Commit SHA to get details for'
						}
					},
					required: ['url', 'sha']
				}
			},
			{
				name: 'analyze_author_work',
				description:
					'Analyze what a specific person worked on between dates or commits. Perfect for "What did Alex do between Tuesday and Friday on branch X?"',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						author: {
							type: 'string',
							description: 'GitHub username or email of the author'
						},
						since: {
							type: 'string',
							description: 'Start date (ISO 8601) or commit SHA'
						},
						until: {
							type: 'string',
							description: 'End date (ISO 8601) or commit SHA'
						},
						branch: {
							type: 'string',
							description: 'Specific branch to analyze'
						}
					},
					required: ['url', 'author']
				}
			},
			{
				name: 'get_pull_requests',
				description:
					'Get pull requests for a repository with flexible query parameters (state, head, base, sort, direction, etc.)',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						state: {
							type: 'string',
							enum: ['open', 'closed', 'all'],
							description: 'State of the pull requests'
						},
						head: {
							type: 'string',
							description: 'Filter pulls by head branch'
						},
						base: {
							type: 'string',
							description: 'Filter pulls by base branch'
						},
						sort: {
							type: 'string',
							enum: ['created', 'updated', 'popularity', 'long-running'],
							description: 'Sort order'
						},
						direction: {
							type: 'string',
							enum: ['asc', 'desc'],
							description: 'Sort direction'
						},
						per_page: {
							type: 'number',
							description: 'Number of results per page (max 100)'
						},
						page: {
							type: 'number',
							description: 'Page number of results to fetch'
						}
					},
					required: ['url']
				}
			},
			{
				name: 'get_issue',
				description: 'Get a specific issue by issue number',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						issue_number: {
							type: 'number',
							description: 'Issue number to retrieve'
						}
					},
					required: ['url', 'issue_number']
				}
			},
			{
				name: 'get_issues',
				description: 'Get multiple issues with flexible query parameters',
				inputSchema: {
					type: 'object',
					properties: {
						url: { type: 'string', description: 'Repository url to query' },
						filter: {
							type: 'string',
							description:
								'Filter issues by assigned, created, mentioned, subscribed, or all'
						},
						state: {
							type: 'string',
							description: 'Issue state: open, closed, or all'
						},
						labels: {
							type: 'string',
							description: 'Comma-separated list of label names'
						},
						sort: {
							type: 'string',
							description: 'Sort by created, updated, or comments'
						},
						direction: {
							type: 'string',
							description: 'Sort direction: asc or desc'
						},
						since: {
							type: 'string',
							description: 'Only issues updated after this time (ISO 8601)'
						},
						per_page: {
							type: 'number',
							description: 'Number of results per page (max 100)'
						},
						page: {
							type: 'number',
							description: 'Page number of results to fetch'
						}
					},
					required: ['url']
				}
			}
		]
	};
}
