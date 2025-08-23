export const getBranches = async (owner: string, repo: string) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
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
					text: `No branches found for the repository at "${apiUrl}". Try a different repository URL.`
				}
			]
		};
	}
	const branches = data.map((b: any) => b.name).join('\n');
	return {
		content: [
			{
				type: 'text',
				text: branches
			}
		]
	};
};
