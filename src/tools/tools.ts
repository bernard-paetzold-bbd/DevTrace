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
