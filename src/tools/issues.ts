import z from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { GithubService } from '../services/github/githubService.js';

export async function callIssueTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			issue_number: z.number()
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

export async function callIssuesTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			filter: z.string().optional(),
			state: z.string().optional(),
			labels: z.string().optional(),
			sort: z.string().optional(),
			direction: z.string().optional(),
			since: z.string().optional(),
			collab: z.boolean().optional(),
			orgs: z.boolean().optional(),
			owned: z.boolean().optional(),
			pulls: z.boolean().optional(),
			per_page: z.number().optional(),
			page: z.number().optional()
		});
		const parsed = schema.parse(args);
		const { url, ...options } = parsed;
		const { owner, repo } = extractUrlInformation(url);
		return await GithubService.getIssues(owner, repo, options);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error retrieving issues: \n  ${
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
			`^[^/]+/[^/]+/(?:${issue_number}|${issue_number
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
