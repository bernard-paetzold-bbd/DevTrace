import { GithubService } from '../../services/github/githubService.js';

export async function GetBranches(url: string) {
	const repoMatch = url.match(/github.com[/:]([^/]+)\/([^/]+)/);
	if (!repoMatch) {
		throw new Error('Invalid GitHub repository URL');
	}
	const owner = repoMatch[1];
	const repo = repoMatch[2].replace(/\.git$/, '');

	const branches = await GithubService.getBranches(owner, repo);

	return branches;
}
