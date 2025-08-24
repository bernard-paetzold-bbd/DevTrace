import { getBranches } from './branchesService.js';
import {
	analyzeAuthorWork,
	compareCommits,
	getCommitDetails,
	getCommits
} from './commitsService.js';
import { getIssue, getIssues } from './issuesService.js';
import { getPullRequest, getPullRequests } from './pullRequestsService.js';

export const GithubService = {
	getBranches: getBranches,

	getPullRequests: getPullRequests,
	getPullRequest: getPullRequest,

	getCommits: getCommits,
	compareCommits: compareCommits,
	getCommitDetails: getCommitDetails,
	analyzeAuthorWork: analyzeAuthorWork,

	getIssue: getIssue,
	getIssues: getIssues
};
