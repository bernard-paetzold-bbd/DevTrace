export async function GetBranches(url: string, GITHUB_TOKEN: string) {
	// Convert the repo URL to GitHub API URL
	const repoMatch = url.match(/github.com[/:]([^/]+)\/([^/]+)/);
	if (!repoMatch) {
		throw new Error('Invalid GitHub repository URL');
	}
	const owner = repoMatch[1];
	const repo = repoMatch[2].replace(/\.git$/, '');
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const data = await response.json();
	if (!Array.isArray(data)) {
		return {
			content: [
				{
					type: 'text',
					text: `No branches found for the repository at "${url}". Try a different repository URL.`
				}
			]
		};
	}
	// Format branch names
	const branches = data.map((b: any) => b.name).join('\n');
	return {
		content: [
			{
				type: 'text',
				text: branches
			}
		]
	};
}
