import { z } from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { GithubService } from '../services/github/githubService.js';

const getBranchListRequestSchema = z.object({
	url: z.string().describe('Repository url you want to query')
});

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
			}
		]
	};
}

export async function callRepoBranchesTool(args: any) {
	try {
		const { url } = getBranchListRequestSchema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.getBranches(owner, repo);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error searching for branches: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}

export async function callCommitsTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			sha: z.string().optional(),
			path: z.string().optional(),
			author: z.string().optional(),
			committer: z.string().optional(),
			since: z.string().optional(),
			until: z.string().optional(),
			per_page: z.number().optional(),
			page: z.number().optional()
		});
		const parsed = schema.parse(args);
		const { url, ...options } = parsed;
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.getCommits(owner, repo, options);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error searching for commits: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}

export async function callPullRequestsTool(args: any) {
    try {
        const schema = z.object({
            url: z.string().describe('Repository url you want to query'),
            state: z.enum(['open', 'closed', 'all']).optional(),
            head: z.string().optional(),
            base: z.string().optional(),
            sort: z.enum(['created', 'updated', 'popularity', 'long-running']).optional(),
            direction: z.enum(['asc', 'desc']).optional(),
            per_page: z.number().optional(),
            page: z.number().optional()
        });
        const parsed = schema.parse(args);
        const { url, ...options } = parsed;
        const { owner, repo } = extractUrlInformation(url);
        return await GithubService.getPullRequests(owner, repo, options);
    } catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Error searching for pull requests: \n  ${
                        error instanceof Error ? error.message : 'Unknown error'
                    }`
                }
            ]
        };
    }
}

export async function callCompareCommitsTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			base: z.string().describe('Base branch or commit SHA'),
			head: z.string().describe('Head branch or commit SHA')
		});
		const { url, base, head } = schema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.compareCommits(owner, repo, base, head);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error comparing commits: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}

export async function callGetCommitDetailsTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			sha: z.string().describe('Commit SHA')
		});
		const { url, sha } = schema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.getCommitDetails(owner, repo, sha);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error getting commit details: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}

export async function callAnalyzeAuthorWorkTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			author: z.string().describe('Author username or email'),
			since: z.string().optional(),
			until: z.string().optional(),
			branch: z.string().optional()
		});
		const { url, author, since, until, branch } = schema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		const options = { since, until, branch };
		return await GithubService.analyzeAuthorWork(owner, repo, author, options);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error analyzing author work: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}