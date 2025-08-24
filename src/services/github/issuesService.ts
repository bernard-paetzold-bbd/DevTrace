/**
 * Create a new issue in a repository
 * @param owner string (required)
 * @param repo string (required) 
 * @param title string (required) - The title of the issue
 * @param body string (optional) - The body text of the issue
 * @param assignees string[] (optional) - Usernames of people to assign
 * @param labels string[] (optional) - Labels to apply to this issue
 */
export const createIssue = async (
	owner: string,
	repo: string,
	title: string,
	body?: string,
	assignees?: string[],
	labels?: string[]
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;

	const payload = {
		title,
		body,
		assignees,
		labels
	};

	// Todo add error stuff


	// Todo hook up actual response
	return {
		content: [
			{
				type: 'text',
				text: 'placeholder'
			}
		]
	};
};

/**
 * Get a single issue for a repo by issue number.
 * @param owner string (required)
 * @param repo string (required)
 * @param issue_number number (required)
 */
export const getIssue = async (
	owner: string,
	repo: string,
	issue_number: number
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`;
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

/**
 * Get multiple issues for a repo with flexible query params.
 * @param owner string (required)
 * @param repo string (required)
 * @param options object (all query params optional)
 */
export const getIssues = async (
	owner: string,
	repo: string,
	options?: {
		filter?: string;
		state?: string;
		labels?: string;
		sort?: string;
		direction?: string;
		since?: string;
		collab?: boolean;
		orgs?: boolean;
		owned?: boolean;
		pulls?: boolean;
		per_page?: number;
		page?: number;
	}
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const params = new URLSearchParams();
	if (options) {
		if (options.filter) params.append('filter', options.filter);
		if (options.state) params.append('state', options.state);
		if (options.labels) params.append('labels', options.labels);
		if (options.sort) params.append('sort', options.sort);
		if (options.direction) params.append('direction', options.direction);
		if (options.since) params.append('since', options.since);
		if (options.collab !== undefined)
			params.append('collab', String(options.collab));
		if (options.orgs !== undefined) params.append('orgs', String(options.orgs));
		if (options.owned !== undefined)
			params.append('owned', String(options.owned));
		if (options.pulls !== undefined)
			params.append('pulls', String(options.pulls));
		if (options.per_page) params.append('per_page', String(options.per_page));
		if (options.page) params.append('page', String(options.page));
	}
	const paramString = params.toString();
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues${
		paramString ? `?${paramString}` : ''
	}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const data = await response.json();

	// Return the full raw JSON issues array for MCP response
	if (!Array.isArray(data) || data.length === 0) {
		return {
			content: [
				{
					type: 'text',
					text: 'No issues found for the specified criteria.'
				}
			]
		};
	}

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(data, null, 2)
			}
		]
	};
};
