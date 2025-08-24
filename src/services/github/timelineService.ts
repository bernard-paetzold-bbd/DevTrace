import { extractUrlInformation } from '../../utils/extractUrlInformation.js';

export async function fetchIssueOrPrTimeline(url: string, number: number) {
	const { owner, repo } = extractUrlInformation(url);
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${number}/timeline`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.mockingbird-preview+json'
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	return await response.json();
}
