import { z } from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { GithubService } from '../services/github/githubService.js';

const getBranchListRequestSchema = z.object({
	url: z.string().describe('Repository url you want to query')
});

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
