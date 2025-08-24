import { fetchIssueOrPrTimeline } from '../services/github/timelineService.js';
import { outputWrapper } from './outputWrapper.js';

export async function callGetIssueOrPrTimelineTool(args: any) {
	try {
		const { url, number, type } = args;
		const timeline = await fetchIssueOrPrTimeline(url, number);
		// Format timeline events for markdown output
		const formatted = timeline
			.map((event: any) => {
				const date =
					event.created_at || event.submitted_at || event.updated_at || '';
				const actor = event.actor?.login || event.user?.login || 'system';
				let summary = `- **${date}**: `;
				switch (event.event) {
					case 'commented':
						summary += `Comment by @${actor}: "${
							event.body?.slice(0, 80) || ''
						}${event.body && event.body.length > 80 ? '...' : ''}"`;
						break;
					case 'assigned':
						summary += `Assigned to @${event.assignee?.login}`;
						break;
					case 'unassigned':
						summary += `Unassigned from @${event.assignee?.login}`;
						break;
					case 'labeled':
						summary += `Labeled: ${event.label?.name}`;
						break;
					case 'unlabeled':
						summary += `Unlabeled: ${event.label?.name}`;
						break;
					case 'closed':
						summary += `Closed by @${actor}`;
						break;
					case 'reopened':
						summary += `Reopened by @${actor}`;
						break;
					case 'renamed':
						summary += `Renamed from "${event.rename?.from}" to "${event.rename?.to}"`;
						break;
					case 'cross-referenced':
						summary += `Cross-referenced from ${
							event.source?.issue?.html_url ||
							event.source?.pull_request?.html_url ||
							''
						}`;
						break;
					case 'review_requested':
						summary += `Review requested from @${event.requested_reviewer?.login}`;
						break;
					case 'reviewed':
						summary += `Reviewed by @${actor}`;
						break;
					default:
						summary += `Event: ${event.event || event.type}`;
				}
				return summary;
			})
			.join('\n');
		return {
			content: [
				{
					type: 'text',
					text: outputWrapper(
						`### Timeline for ${type} #${number}\n\n${formatted}`
					)
				}
			]
		};
	} catch (error) {
		return {
			isError: true,
			content: [
				{
					type: 'text',
					text: `Error retrieving timeline: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}
			]
		};
	}
}
