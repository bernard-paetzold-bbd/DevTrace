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

import {
	callRepoBranchesTool,
	callCommitsTool,
	listTools,
	callIssueTool,
	callIssueCommits
} from './tools/tools.js';

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return listTools();
});

server.setRequestHandler(CallToolRequestSchema, async request => {
	if (request.params.name === 'get_repo_branches') {
		return callRepoBranchesTool(request.params.arguments);
	}
	if (request.params.name === 'get_commits') {
		return callCommitsTool(request.params.arguments);
	}
	if (request.params.name === 'get_issue') {
		return callIssueTool(request.params.arguments);
	}
	if (request.params.name === 'get_issue_commits') {
		return callIssueCommits(request.params.arguments);
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
