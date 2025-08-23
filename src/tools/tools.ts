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
				description: 'List git branches in a specified repository',
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
				name: 'get_issue',
				description: 'Get a specific issue from a repository',
				inputSchema: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							description: 'Repository url to query'
						},
						issue_number: {
							type: 'number',
							description: 'Issue number to retrieve'
						}
					},
					required: ['url', 'issue_number']
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

export async function callIssueTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			issue_number: z.number().min(1).describe('Issue number to retrieve')
		});
		const parsed = schema.parse(args);
		const { url, issue_number } = parsed;
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.getIssue(owner, repo, issue_number);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error retrieving issue: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}

// Find a branch in the format developer/feature/issue number and return its commits
export async function callIssueCommits(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			issue_number: z
				.union([z.string(), z.number()])
				.describe('Issue number to search for')
		});
		const parsed = schema.parse(args);
		const { url, issue_number } = parsed;
		const { owner, repo } = extractUrlInformation(url);
		// Get all branches
		const branchesResult = await GithubService.getBranches(owner, repo);
		const branchesText = branchesResult.content[0]?.text || '';
		// Regex for developer/feature/issue_number (allowing both / and - as separators)
		const regex = new RegExp(
			`^[^/]+/feature/(?:${issue_number}|${issue_number
				.toString()
				.padStart(4, '0')})$`,
			'i'
		);
		const branch = branchesText.split('\n').find(b => regex.test(b.trim()));
		if (!branch) {
			return {
				isError: true,
				content: [
					{
						type: 'text',
						text: `No branch found for issue number ${issue_number}`
					}
				]
			};
		}
		// Get commits for the found branch
		const commitsResult = await GithubService.getCommits(owner, repo, {
			sha: branch
		});
		return commitsResult;
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error searching for issue branch commits: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}
