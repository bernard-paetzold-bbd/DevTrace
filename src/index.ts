import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
	{
		name: 'dev-trace',
		version: '0.0.1'
	},
	{
		capabilities: {
			tools: {}
		}
	}
);

import { listTools } from './tools/tools.js';

import { callRepoBranchesTool } from './tools/branches.js';
import {
	callIssuesTool,
	callIssueTool,
	callIssueCommits,
	callEstimateIssueProgressTool
} from './tools/issues.js';
import {
	callGetPullRequestTool,
	callPullRequestsTool
} from './tools/pullRequests.js';
import {
	callCommitsTool,
	callCompareCommitsTool,
	callGetCommitDetailsTool,
	callAnalyzeAuthorWorkTool,
	callGetBranchCommitsTool
} from './tools/commits.js';
import { callGetIssueOrPrTimelineTool } from './tools/timeline.js';

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return listTools();
});

server.setRequestHandler(CallToolRequestSchema, async request => {
	if (request.params.name === 'get_issue_or_pr_timeline') {
		return callGetIssueOrPrTimelineTool(request.params.arguments);
	}
	if (request.params.name === 'get_repo_branches') {
		return callRepoBranchesTool(request.params.arguments);
	}
	if (request.params.name === 'get_commits') {
		return callCommitsTool(request.params.arguments);
	}
	if (request.params.name === 'compare_commits') {
		return callCompareCommitsTool(request.params.arguments);
	}
	if (request.params.name === 'get_commit_details') {
		return callGetCommitDetailsTool(request.params.arguments);
	}
	if (request.params.name === 'analyze_author_work') {
		return callAnalyzeAuthorWorkTool(request.params.arguments);
	}
	if (request.params.name === 'get_pull_requests') {
		return callPullRequestsTool(request.params.arguments);
	}
	if (request.params.name === 'get_issue') {
		let output = await callIssueTool(request.params.arguments);

		output.content.map((item: any) => {
			item.text +=
				'\n\nIf the user asked for status or progress at all [estimate_issue_progress_or_status] to provide that information';
		});

		return output;
	}
	if (request.params.name === 'get_issues') {
		return callIssuesTool(request.params.arguments);
	}
	if (request.params.name === 'estimate_issue_progress_or_status') {
		let output = await callEstimateIssueProgressTool(request.params.arguments);

		output.content.map((item: any) => {
			item.text +=
				'\n\nIf no branch was found, call [get_branches] and attempt to find the branch from there, then call [get_branch_commits] to estimate the progress. After this, call [get_issue_or_pr_timeline] for additional context to include in the estimation';
		});

		return output;
	}
	if (request.params.name === 'get_branch_commits') {
		return callGetBranchCommitsTool(request.params.arguments);
	}
	if (request.params.name === 'get_pull_request') {
		return callGetPullRequestTool(request.params.arguments);
	}
	// Handle unknown tool
	return {
		isError: true,
		content: [
			{
				type: 'text',
				text: `Unknown tool: ${request.params.name}`
			}
		]
	};
});

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch(err => {
	console.error('Fatal error:', err);
	process.exit(1);
});
