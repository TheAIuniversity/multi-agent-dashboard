import fetch from 'node-fetch';

// Server-side only API key - never exposed to clients
// All users' tasks get summaries but key remains secure on server
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Generate a plain English summary of completed tasks using Haiku 3.5
 * @param {Array} events - Array of events from the session
 * @param {string} sessionId - Session ID
 * @returns {Promise<string>} - Plain English summary
 */
export async function generateTaskSummary(events, sessionId) {
  // Check if API key is configured
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
    console.log('Haiku API key not configured, using fallback summary');
    return fallbackSummary(events);
  }

  try {
    // Filter and prepare relevant events
    const toolEvents = events.filter(e => 
      e.event_type === 'PreToolUse' || 
      e.event_type === 'PostToolUse' ||
      e.event_type === 'UserPromptSubmit'
    );

    // Build context from events
    let context = "Task Session Summary:\n\n";
    
    // Get initial user request
    const userPrompts = events.filter(e => e.event_type === 'UserPromptSubmit');
    if (userPrompts.length > 0) {
      const lastPrompt = JSON.parse(userPrompts[userPrompts.length - 1].payload || '{}');
      context += `User Request: ${lastPrompt.prompt || 'Unknown request'}\n\n`;
    }

    // List tools used and their purposes
    context += "Actions Taken:\n";
    const toolUses = events.filter(e => e.event_type === 'PreToolUse');
    toolUses.forEach((event, index) => {
      const payload = JSON.parse(event.payload || '{}');
      context += `${index + 1}. Used ${payload.tool || 'tool'}: ${event.summary || ''}\n`;
    });

    // Create prompt for Haiku
    const prompt = `Please provide a concise, plain English summary of what was accomplished in this task session. Focus on:
1. What the user asked for
2. What specific actions were taken
3. What was completed/achieved
4. Where to find the results (file paths, locations)

Context:
${context}

Provide a 2-3 sentence summary that a non-technical person could understand. Focus on outcomes, not technical details.`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Haiku API error:', response.status, await response.text());
      return fallbackSummary(events);
    }

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    return fallbackSummary(events);
  } catch (error) {
    console.error('Error generating summary:', error);
    return fallbackSummary(events);
  }
}

/**
 * Fallback summary when API fails
 */
function fallbackSummary(events) {
  const toolCount = events.filter(e => e.event_type === 'PreToolUse').length;
  const userPrompt = events.find(e => e.event_type === 'UserPromptSubmit');
  
  if (userPrompt) {
    const payload = JSON.parse(userPrompt.payload || '{}');
    return `Completed task with ${toolCount} actions. User requested: "${payload.prompt || 'task completion'}".`;
  }
  
  return `Session completed with ${toolCount} tool uses.`;
}

/**
 * Generate summary for Stop event
 */
export async function generateStopEventSummary(sessionId, db) {
  return new Promise((resolve, reject) => {
    // Get all events for this session
    db.all(
      `SELECT * FROM events 
       WHERE session_id = ? 
       ORDER BY timestamp ASC`,
      [sessionId],
      async (err, events) => {
        if (err) {
          console.error('Error fetching session events:', err);
          resolve('Task completed.');
          return;
        }

        if (!events || events.length === 0) {
          resolve('Task completed with no recorded actions.');
          return;
        }

        // Generate summary
        const summary = await generateTaskSummary(events, sessionId);
        resolve(summary);
      }
    );
  });
}

export default {
  generateTaskSummary,
  generateStopEventSummary
};