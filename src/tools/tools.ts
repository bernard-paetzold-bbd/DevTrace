import { z } from 'zod';
import { GetBranches } from './getBranches/getBranches.js';

const GITHUB_TOKEN = 'move_to_config';

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
			}
		]
	};
}

export async function callRepoBranchesTool(args: any) {
	try {
		const { url } = getBranchListRequestSchema.parse(args);
		// Use the GetBranches function from getBranches
		return await GetBranches(url, GITHUB_TOKEN);
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
