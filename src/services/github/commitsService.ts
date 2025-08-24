import { GithubService } from './githubService.js';

// Type definitions for commits
export interface CommitAuthor {
	name: string;
	email: string;
	date: string;
}

export interface CommitData {
	sha: string;
	message: string;
	author: CommitAuthor;
	url: string;
}

export interface CommitsResponse {
	commits: CommitData[];
	content: Array<{
		type: string;
		text: string;
	}>;
}

/**
 * Get commits for a repo with flexible query params.
 * @param owner string (required)
 * @param repo string (required)
 * @param options object (all query params optional)
 */
export const getCommits = async (
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
): Promise<CommitsResponse> => {
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
			String(Number(process.env.MAX_COMMIT_HISTORY) || 100)
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

	// Create structured commit data
	const commits: CommitData[] = data.map((c: any) => ({
		sha: c.sha,
		message: c.commit.message,
		author: {
			name: c.commit.author?.name || 'Unknown',
			email: c.commit.author?.email || 'Unknown',
			date: c.commit.author?.date || 'Unknown'
		},
		url: c.html_url
	}));

	// Create text representation for compatibility
	const commitsText = commits
		.map(c => {
			return `Commit: ${c.sha}\nAuthor: ${c.author.name}\nDate: ${c.author.date}\nMessage: ${c.message}\n`;
		})
		.join('\n---------------------\n');

	return {
		commits,
		content: [
			{
				type: 'text',
				text: commitsText
			}
		]
	};
};

/**
 * Get commits made only on a specific branch (not inherited from base branch)
 * @param owner string (required)
 * @param repo string (required)
 * @param branch string (required) - the feature branch
 * @param baseBranch string (optional) - the base branch to compare against (defaults to 'main')
 */
export const getBranchCommits = async (
	owner: string,
	repo: string,
	branch: string,
	baseBranch: string = 'main'
): Promise<CommitsResponse> => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	// URL encode the branch names to handle special characters like #
	const encodedBaseBranch = encodeURIComponent(baseBranch.trim());
	const encodedBranch = encodeURIComponent(branch.trim());
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${encodedBaseBranch}...${encodedBranch}`;

	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}

	const data = await response.json();

	// Extract commits that are unique to the branch (not in base)
	const commits: CommitData[] = (data.commits || []).map((c: any) => ({
		sha: c.sha,
		message: c.commit.message,
		author: {
			name: c.commit.author?.name || 'Unknown',
			email: c.commit.author?.email || 'Unknown',
			date: c.commit.author?.date || 'Unknown'
		},
		url: c.html_url
	}));

	// Create text representation for compatibility
	const commitsText = commits
		.map(c => {
			return `Commit: ${c.sha}\nAuthor: ${c.author.name}\nDate: ${c.author.date}\nMessage: ${c.message}\n`;
		})
		.join('\n---------------------\n');

	return {
		commits,
		content: [
			{
				type: 'text',
				text: commitsText
			}
		]
	};
};

/**
 * Compare two commits or branches and get the diff
 * @param owner string (required)
 * @param repo string (required)
 * @param base string (required) - base commit/branch
 * @param head string (required) - head commit/branch to compare
 */
export const compareCommits = async (
	owner: string,
	repo: string,
	base: string,
	head: string
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`;

	// Fetch the full diff
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3.diff'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}

	const diffText = await response.text();

	// Also fetch basic metadata for context
	const jsonResponse = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	const data = await jsonResponse.json();

	// Return the full diff with context for the AI model to interpret
	const output = `
		## Comparison: ${base} to ${head}

		**Context:**
		- Commits: ${data.commits?.length || 0}
		- Authors: ${[
			...new Set(data.commits?.map((c: any) => c.commit.author?.name) || [])
		].join(', ')}
		- Period: ${new Date(
			data.commits?.[0]?.commit?.author?.date
		).toLocaleDateString()} to ${new Date(
		data.commits?.[data.commits.length - 1]?.commit?.author?.date
	).toLocaleDateString()}
		- Files changed: ${data.files?.length}

		**Commit messages:**
		${data.commits
			?.map((c: any) => `- ${c.commit.message.split('\n')[0]}`)
			.slice(0, 10)
			.join('\n')}

		**Full diff for analysis:**
		\`\`\`diff
		${diffText}
		\`\`\`

		Please analyze this diff to understand what changes were made between ${base} and ${head}.`;

	return {
		content: [
			{
				type: 'text',
				text: output
			}
		]
	};
};

/**
 * Get detailed commit information including file changes
 * @param owner string (required)
 * @param repo string (required)
 * @param sha string (required) - commit SHA
 */
export const getCommitDetails = async (
	owner: string,
	repo: string,
	sha: string
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const data = await response.json();

	// Fetch the full patch for this commit
	const patchResponse = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3.patch'
		}
	});
	const patchText = await patchResponse.text();

	// Return the full patch with context for AI interpretation
	const output = `
		## Commit: ${data.sha.substring(0, 7)}

		**Metadata:**
		- Author: ${data.commit.author?.name}
		- Date: ${new Date(data.commit.author?.date).toLocaleString()}
		- Message: ${data.commit.message}
		- Files changed: ${data.files?.length || 0}
		- Stats: +${data.stats?.additions || 0} -${data.stats?.deletions || 0}

		**Files modified:**
		${
			data.files
				?.map(
					(f: any) =>
						`- ${f.filename} (${f.status}): +${f.additions} -${f.deletions}`
				)
				.join('\n') || 'No files'
		}

		**Full patch for analysis:**
		\`\`\`patch
		${patchText}
		\`\`\`

		Please analyze this commit to understand what changes were made.`;

	return {
		content: [
			{
				type: 'text',
				text: output
			}
		]
	};
};

/**
 * Analyze work done by a specific author between dates/commits
 * @param owner string (required)
 * @param repo string (required)
 * @param author string (required)
 * @param since string (optional) - ISO date or commit SHA
 * @param until string (optional) - ISO date or commit SHA
 * @param branch string (optional) - specific branch to analyze
 */
export const analyzeAuthorWork = async (
	owner: string,
	repo: string,
	author: string,
	options?: {
		since?: string;
		until?: string;
		branch?: string;
	}
) => {
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
	const params = new URLSearchParams();
	params.append('author', author);
	if (options?.since) params.append('since', options.since + 'T00:00:00Z');
	if (options?.until) params.append('until', options.until + 'T23:59:59Z');
	if (options?.branch) params.append('sha', options.branch);
	params.append('per_page', '100');

	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`;
	const response = await fetch(apiUrl, {
		headers: {
			Authorization: `Bearer ${GITHUB_TOKEN}`
		}
	});
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	const commits = await response.json();

	// Fetch patches for the most recent commits to show actual changes
	const commitPatches = await Promise.all(
		commits.slice(0, 10).map(async (commit: any) => {
			const patchResponse = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
				{
					headers: {
						Authorization: `Bearer ${GITHUB_TOKEN}`,
						Accept: 'application/vnd.github.v3.patch'
					}
				}
			);
			if (patchResponse.ok) {
				const patch = await patchResponse.text();
				return {
					sha: commit.sha,
					message: commit.commit.message,
					date: commit.commit.author?.date,
					patch: patch
				};
			}
			return null;
		})
	);

	const validPatches = commitPatches.filter(p => p !== null);

	// Build time description
	const timeDesc =
		options?.since && options?.until
			? `between ${new Date(options.since).toLocaleDateString()} and ${new Date(
					options.until
			  ).toLocaleDateString()}`
			: options?.since
			? `since ${new Date(options.since).toLocaleDateString()}`
			: options?.until
			? `until ${new Date(options.until).toLocaleDateString()}`
			: 'in the recent history';

	const branchDesc = options?.branch ? ` on branch "${options.branch}"` : '';

	// Create output with full patches for AI analysis
	const output = `
		## Author Work Analysis: ${author}

		**Query:** What did ${author} work on ${timeDesc}${branchDesc}?

		**Overview:**
		- Total commits found: ${commits.length}
		- Showing detailed patches for: ${validPatches.length} most recent commits

		**Commit list:**
		${commits
			.map(
				(c: any) =>
					`- ${c.sha.substring(0, 7)}: ${
						c.commit.message.split('\n')[0]
					} (${new Date(c.commit.author?.date).toLocaleDateString()})`
			)
			.join('\n')}

		**Detailed patches for analysis:**
		${validPatches
			.map(
				(p: any) => `
		### Commit ${p.sha.substring(0, 7)}
		Date: ${new Date(p.date).toLocaleString()}
		Message: ${p.message}

		\`\`\`patch
		${p.patch.substring(0, 3000)}${p.patch.length > 3000 ? '\n...(truncated)' : ''}
		\`\`\`
		`
			)
			.join('\n---\n')}

		Please analyze these commits to understand what ${author} worked on during this period. Focus on:
		1. What features or functionality were added/modified
		2. What problems were solved
		3. The overall impact of their work on the project
		`;

	return {
		content: [
			{
				type: 'text',
				text: output
			}
		]
	};
};
