import { z } from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { createIssue } from '../services/github/issuesService.js';

export async function callCreateIssueTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url to create the issue in'),
			title: z.string().describe('The title of the issue'),
			body: z.string().optional().describe('The body text of the issue'),
			assignees: z.array(z.string()).optional().describe('Usernames of people to assign'),
			labels: z.array(z.string()).optional().describe('Labels to apply to the issue')
		});

		const { url, title, body, assignees, labels } = schema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		
		return await createIssue(owner, repo, title, body, assignees, labels);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error creating issue: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}
