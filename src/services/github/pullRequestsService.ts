export const getPullRequests = async (
	owner: string,
	repo: string,
	options?: {
		state?: 'open' | 'closed' | 'all';
		head?: string;
		base?: string;
		sort?: 'created' | 'updated' | 'popularity' | 'long-running';
		direction?: 'asc' | 'desc';
		per_page?: number;
		page?: number;
	}
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const params = new URLSearchParams();
	if (options) {
		if (options.state) params.append('state', options.state);
		if (options.head) params.append('head', options.head);
		if (options.base) params.append('base', options.base);
		if (options.sort) params.append('sort', options.sort);
		if (options.direction) params.append('direction', options.direction);
		if (options.per_page) params.append('per_page', String(options.per_page));
		if (options.page) params.append('page', String(options.page));
	}
	// Default per_page if not set
	if (!params.has('per_page')) {
		params.append('per_page', '30');
	}
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?${params.toString()}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const data = await response.json();
	if (!Array.isArray(data) || data.length === 0) {
		return {
			content: [
				{
					type: 'text',
					text: `No pull requests found for the repository at "${apiUrl}".`
				}
			]
		};
	}
	const pulls = data
		.map((pr: any) => {
			// Show all relevant PR info as pretty-printed JSON
			return JSON.stringify(pr, null, 2);
		})
		.join('\n---------------------\n');
	return {
		content: [
			{
				type: 'text',
				text: pulls
			}
		]
	};
};

export const getPullRequest = async (
	owner: string,
	repo: string,
	pull_number: number
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const data = await response.json();
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(data, null, 2)
			}
		]
	};
};
