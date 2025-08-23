import z from 'zod';
import { extractUrlInformation } from '../utils/extractUrlInformation.js';
import { findBranchByIssueNumber } from '../utils/findBranchByIssueNumber.js';
import { GithubService } from '../services/github/githubService.js';
import { callCompareCommitsTool } from './commits.js';
import {
	getBranchCommits,
	getCommits,
	type CommitsResponse
} from '../services/github/commitsService.js';

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

		const branch = await findBranchByIssueNumber(owner, repo, issue_number);
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

export async function callEstimateIssueProgressTool(args: any) {
	try {
		const schema = z.object({
			url: z.string().describe('Repository url you want to query'),
			issue_number: z.number().describe('Issue number to estimate progress for')
		});
		const parsed = schema.parse(args);
		const { url, issue_number } = parsed;
		const { owner, repo } = extractUrlInformation(url);

		const issue = await GithubService.getIssue(owner, repo, issue_number);

		const branch = await findBranchByIssueNumber(owner, repo, issue_number);
		if (!branch) {
			return {
				content: [
					{
						type: 'text',
						text: `Issue: ${JSON.stringify(
							issue,
							null,
							2
						)}\n\nNo branch found for issue number ${issue_number}`
					}
				]
			};
		}

		let issueCommits = await getBranchCommits(owner, repo, branch);
		const allCommits = await getCommits(owner, repo, { sha: branch });

		// If no commits found (probably already merged), fall back to generic commits endpoint
		if (
			!('commits' in issueCommits) ||
			!issueCommits.commits ||
			issueCommits.commits.length === 0
		) {
			issueCommits = allCommits;
		}

		// Check if we have commits and they're in the expected format
		if (
			'commits' in issueCommits &&
			issueCommits.commits &&
			issueCommits.commits.length > 0
		) {
			// Find the last commit on the base branch that is not in the branch commits
			// allCommits.commits: all commits on the base branch (including merged ones)
			// issueCommits.commits: commits unique to the feature branch
			let firstCommit = null;
			if (
				Array.isArray(allCommits.commits) &&
				Array.isArray(issueCommits.commits)
			) {
				// Create a Set of SHAs in the branch commits
				const branchCommitShas = new Set(
					issueCommits.commits.map((c: any) => c.sha)
				);
				// Find the last commit in allCommits that is NOT in the branch commits
				firstCommit = allCommits.commits.find(
					(c: any) => !branchCommitShas.has(c.sha)
				);
				// If not found (e.g. branch not diverged), fallback to first in branch
				if (!firstCommit && issueCommits.commits.length > 0) {
					firstCommit = issueCommits.commits[0];
				}
			} else {
				firstCommit = issueCommits.commits[0];
			}
			const lastCommit = issueCommits.commits[issueCommits.commits.length - 1];

			if (!firstCommit) {
				return {
					content: [
						{
							type: 'text',
							text: `Issue: ${JSON.stringify(
								issue,
								null,
								2
							)}\n\nNo valid base commit found for diff.\nCommits:\n${
								issueCommits.content[0]?.text
							}`
						}
					]
				};
			}
			const diff = await callCompareCommitsTool({
				url,
				base: firstCommit.sha,
				head: lastCommit.sha
			});

			return {
				content: [
					{
						type: 'text',
						text: `Issue: ${JSON.stringify(issue, null, 2)}\n\nCommits:\n${
							issueCommits.content[0]?.text
						}\n\nDiff: ${diff.content[0]?.text || 'No diff available'}`
					}
				]
			};
		}

		return {
			content: [
				{
					type: 'text',
					text: `Issue: ${JSON.stringify(issue, null, 2)}\n\nCommits:\n${
						issueCommits.content[0]?.text
					}`
				}
			]
		};
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error estimating issue progress: \n  ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}
