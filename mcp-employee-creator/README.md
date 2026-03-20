# MCP Employee Creator

## Setup

- This demo requires an Anthropic API key. [This](https://www.relay.app/blog/how-to-buy-credits-for-the-anthropic-claude-api) is a decent guide to setting one up
  - I reccomend purchasing credits in advance rather than pay as you go to avoid any surprises
  - $5USD is the minimum spend but that should be ample. With the Claude haiku model you're paying about 1c per 5-10 calls to `/chat`
- Both the spring boot app and the mcp server have `.env.example` files. You will need to create `.env` files with the right values for your setup
- You will need to run the employee creator spring app first to seed the database
- You will need the employee creator running on port 8080 for your MCP server to be able to use all the tools
- Remember to `npm install` to install the packages required for the MCP server
- `npm run dev` to run the MCP server

## The Spring Application

This example uses a pre built spring boot backend. Feel free to explore the code at your lesiure, but the focus here will be on the seperate MCP Server.

## MCP Server

This is an [express](https://expressjs.com/) server written in TypeScript. You do not need to be an expert in express to understand this code. Just keep in mind it is a quite lightweight way of building APIs.

The idea behind an MCP server is that we write tools, which go beyond the capabilities of a foundational model. We could access APIs, search for real time data, access a file system, send an email, really anything we have the capability of doing with code. And we provide a **standard interface** to allow a foundational model of our chosing to do this.

### The Express Server

The express server itself exposes several endpoints. For the most part these work like standard endpoints you're used to

#### Health Check

```bash
GET http://localhost:3000/health
```

#### List Tools

```bash
POST http://localhost:3000/tools/list
```

#### Execute Tool

```bash
POST http://localhost:3000/tools/call
Content-Type: application/json

{
  "method": "tools/call",
  "params": {
    "name": "get_glossary",
    "arguments": {}
  }
}
```

Execute tool is a bit more nuanced, you can use any of the tools defined in `handlers.ts` - For example we have the ability to send (select only) SQL queries directly

```bash
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "run_query",
      "arguments": {
        "query": "SELECT * FROM employees LIMIT 5"
      }
    }
  }'
```

or access information from our api

```bash
curl -X POST http://localhost:3000/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "get_employee_by_id",
      "arguments": {
        "id": 10
      }
    }
  }'
```

### Tools

There are several tools written in to this server. You can see them all in `hanlders.ts` or you can look at their summary in `tools.ts`
Notice that they interact with our data in different ways. Some of them connect directly to our API, some connect directly to our database with pre-defined SQL queries. One even allows for any custom LLM query. Our tools can do all sorts of things, the main thing to note here is that we return a response in a standard text based format.

### The LLM Integration

`POST /chat` is where we start to utilise the power of foundational models. We can send any standard written question to a foundational model of our choice. For this example we'll use Anthropic but most models support MCP.

```ts
let response: Message = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 4096,
  system: systemPrompt,
  tools: TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  })),
  messages,
});
```

Importantly we **send along the information about our tools**
The sdk allows claude to "reason" about which tools to use to answer our question.
It's also worth noting the system prompt at `prompt.ts` - this is bordering on prompt engineering terrirtory - feel free to explore this to see if you can get better results.
The response is fed back to claude

```ts
// Add assistant message with tool use
messages.push({
  role: 'assistant',
  content: response.content,
});

// Add user message with tool results
messages.push({
  role: 'user',
  content: toolResults,
});

// Continue conversation
response = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 4096,
  system: systemPrompt,
  tools: TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  })),
  messages,
});
```

until claude determines no more tool use is neccesary and a final message is produced

```ts
// Extract final text response
const textBlocks = response.content.filter(
  (block): block is TextBlock => block.type === 'text'
);
const finalResponse = textBlocks.map((block) => block.text).join('\n');

const chatResponse: ChatResponse = {
  response: finalResponse,
  tools_used: toolsUsed,
};

res.json(chatResponse);
```

For the purpose of the demo we can see which tools have been used, and there are some console logs left in the tool use itself. I encourage you to play with this and try and figure out exactly where data is being surfaced.

### Limitations

- Although the system prompt helps remember that LLMs are not immune to hallucination. You should always verify your results
- To be cost effective this demo uses the claude `hakiu` model. This model is much cheaper but doesn't reason as well as something like `sonnet` - this could very likely lead to odd answers
- Your results are only as good as your tools. Some of the promotion queries were added in later as claude haiku could not reason an effective SQL query on its own
  - These are quite complex queries and may not be perfect. Feel free to verify them
- This demo was put together quickly, not everything in the code base is best practice. There are many ways to structure your code this is just one of them
