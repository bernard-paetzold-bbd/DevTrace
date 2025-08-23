export const GithubService = {
	getBranches: async (owner: string, repo: string) => {
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
	},

	/**
	 * Get commits for a repo with flexible query params.
	 * @param owner string (required)
	 * @param repo string (required)
	 * @param options object (all query params optional)
	 */
	getCommits: async (
		owner: string,
		repo: string,
		options?: {
			sha?: string;
			path?: string;
			author?: string;
			committer?: string;
			since?: string;
			until?: string;
			per_page?: number;
			page?: number;
		}
	) => {
		const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
		const params = new URLSearchParams();
		if (options) {
			if (options.sha) params.append('sha', options.sha);
			if (options.path) params.append('path', options.path);
			if (options.author) params.append('author', options.author);
			if (options.committer) params.append('committer', options.committer);
			if (options.since) params.append('since', options.since);
			if (options.until) params.append('until', options.until);
			if (options.per_page) params.append('per_page', String(options.per_page));
			if (options.page) params.append('page', String(options.page));
		}
		// Default per_page if not set
		if (!params.has('per_page')) {
			params.append(
				'per_page',
				String(Number(process.env.MAX_COMMIT_HISTORY) || 50)
			);
		}
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`;
		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`
			}
		});
		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.statusText}`);
		}
		const data = await response.json();

		const commits = data
			.map((c: any) => {
				const message = c.commit.message;
				const hash = c.sha;
				const author = c.commit.author?.name || 'Unknown';
				const date = c.commit.author?.date || 'Unknown';
				return `Commit: ${hash}\nAuthor: ${author}\nDate: ${date}\nMessage: ${message}\n`;
			})
			.join('\n---------------------\n');
		return {
			content: [
				{
					type: 'text',
					text: commits
				}
			]
		};
	},

	getPullRequests: async (
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
				const title = pr.title;
				const number = pr.number;
				const user = pr.user?.login || 'Unknown';
				const state = pr.state;
				const created = pr.created_at;
				return `#${number} [${state}] by ${user} on ${created}\nTitle: ${title}\n`;
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
	}
};
