import z from 'zod';
import { GithubService } from '../services/github/githubService.js';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';

export async function callPullRequestsTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			state: z.enum(['open', 'closed', 'all']).optional(),
			head: z.string().optional(),
			base: z.string().optional(),
			sort: z
				.enum(['created', 'updated', 'popularity', 'long-running'])
				.optional(),
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
