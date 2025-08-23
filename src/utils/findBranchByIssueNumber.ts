import { GithubService } from '../services/github/githubService.js';

/**
 * Finds a branch that matches the pattern developer/feature/issue_number
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param issueNumber - Issue number to search for
 * @returns Branch name if found, null if not found
 */
export async function findBranchByIssueNumber(
	owner: string,
	repo: string,
	issueNumber: string | number
): Promise<string | null> {
	try {
		// Get all branches
		const branchesResult = await GithubService.getBranches(owner, repo);
		const branchesText = branchesResult.content[0]?.text || '';

		console.log(branchesResult);

		// Regex for developer/feature/#issue_number (requiring # before the issue number)
		const regex = new RegExp(
			`^[^/]+/[^/]+/#(?:${issueNumber}|${issueNumber
				.toString()
				.padStart(4, '0')})$`,
			'i'
		);

		const branch = branchesText.split('\n').find(b => regex.test(b.trim()));
		return branch?.trim() || null;
	} catch (error) {
		console.error('Error finding branch by issue number:', error);
		return null;
	}
}
