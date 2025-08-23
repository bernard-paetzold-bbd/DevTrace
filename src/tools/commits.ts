import z from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { GithubService } from '../services/github/githubService.js';
import { getBranchCommits } from '../services/github/commitsService.js';

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

export async function callGetBranchCommitsTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			branch: z.string().describe('The feature branch to get commits for'),
			base_branch: z
				.string()
				.optional()
				.describe('The base branch to compare against (defaults to "main")')
		});
		const { url, branch, base_branch } = schema.parse(args);
		const { owner, repo } = extractUrlInformation(url);
		return await getBranchCommits(owner, repo, branch, base_branch);
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error getting branch commits: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}
