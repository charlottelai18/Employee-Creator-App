# Employee Creator App

## Live Demo

- **Frontend (S3):** http://employee-creator-frontend-charlotte.s3-website-ap-southeast-2.amazonaws.com
- **Backend API (EC2):** http://13.210.62.139:8080/api/employees

## Demo & Snippets

- App runs locally at `http://localhost:5173` (frontend) and `http://localhost:8080` (backend)

**Employee List Page**
![Employee List Page](screenshots/list-page.png)

**Employee Form Page**
![Employee Form Page](screenshots/form-page1.png)
![Employee Form Page](screenshots/form-page2.png)

---

## Requirements / Purpose

### MVP
A full-stack web application that allows a company to manage their employees. Users can create, view, edit and delete employee records through a clean and intuitive interface. An AI-powered HR assistant is integrated into the frontend, allowing users to query employee data using natural language.

### Purpose
Built as a capstone project during the _nology Full Stack Engineer Program. The goal was to demonstrate proficiency across the full stack — designing and building a RESTful API in Java with Spring Boot, connecting it to a MySQL database, consuming it from a React TypeScript frontend with form validation and state management, deploying the full application on AWS, and integrating an AI chatbot using the Anthropic Claude API and Model Context Protocol (MCP).

### Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | Java 25 + Spring Boot 3.5 | Industry-standard Java framework with built-in dependency injection, JPA integration, and RESTful support out of the box |
| Database | MySQL 9.5 on AWS RDS | Managed relational database — RDS handles backups, patching, and availability automatically |
| ORM | Spring Data JPA / Hibernate | Removes boilerplate SQL — maps Java classes directly to database tables and auto-generates queries |
| Frontend | React 18 + TypeScript | Component-based UI with TypeScript's type safety catching bugs at compile time rather than runtime |
| Build Tool | Vite | Fast development server with instant hot module replacement |
| Form Validation | React Hook Form + Zod | React Hook Form manages form state efficiently; Zod provides schema-based validation with TypeScript inference |
| Styling | SCSS | Nested syntax and variables make styles cleaner and more maintainable than plain CSS |
| HTTP Client | Axios | Cleaner API than the native fetch with automatic JSON parsing and better error handling |
| Routing | React Router v6 | Declarative client-side routing for navigating between list and form pages |
| AI Integration | Anthropic Claude Haiku + MCP | Claude Haiku chosen for cost efficiency (~1c per 5-10 calls); MCP (Model Context Protocol) provides a standardised way to give Claude tools to query real employee data |
| MCP Server | Express + TypeScript | Separate Express server that manages the tool use loop between Claude and the database |
| Frontend Hosting | AWS S3 | Static website hosting — cheap, scalable, and highly available |
| Backend Hosting | AWS EC2 | Virtual server running the Spring Boot JAR and MCP server on the same instance |

---

## Architecture

```
User Browser
     │
     ▼
AWS S3 (React frontend)
     │
     ├──── CRUD calls (GET/POST/PUT/DELETE) ────► EC2: Spring Boot API (port 8080)
     │                                                        │
     └──── Chat messages (POST /chat) ─────────► EC2: MCP Server (port 3000)
                                                              │
                                                    ┌─────────┴──────────┐
                                                    ▼                    ▼
                                             Anthropic API         AWS RDS MySQL
                                            (Claude Haiku)        (private VPC)
                                                    │                    │
                                                    └────── answer ──────┘
```

Both the Spring Boot backend and the MCP server run on the same EC2 instance. RDS sits inside a private VPC — only EC2 can reach it directly, which means the database is never exposed to the public internet.

---

## Build Steps

### Prerequisites
- Java 17+ (project uses Java 25)
- Node.js 18+ and npm
- MySQL 8+
- Maven

### 1. Database Setup
```sql
CREATE DATABASE employees_db;
```

### 2. Backend Setup
```bash
cd backend
# Update src/main/resources/application.properties with your MySQL credentials
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`. Spring JPA will automatically create the `employees` table on first run.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. MCP Server Setup
```bash
cd mcp-employee-creator/mcp-server
npm install
```

Create a `.env` file in the `mcp-server` folder:
```
ANTHROPIC_API_KEY=your-anthropic-api-key
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
PORT=3000
```

Then run:
```bash
npm run dev
```

The MCP server will start on `http://localhost:3000`.

### 5. Frontend .env
Create a `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:8080/api/employees
VITE_MCP_URL=http://localhost:3000
```

### application.properties configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employees_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

---

## AWS Deployment

### Architecture Overview
- **S3** — React frontend deployed as a static website. Built with `npm run build` and synced using `aws s3 sync dist/ s3://your-bucket-name --delete`
- **EC2** — Amazon Linux 2023 instance running both the Spring Boot JAR (port 8080) and the MCP server (port 3000). Spring Boot is launched with `nohup java -Xmx512m -jar api.jar` and the MCP server with `nohup npx ts-node --transpile-only src/index.ts`
- **RDS** — MySQL 8 managed database. Configured as not publicly accessible — only the EC2 instance can reach it through the private VPC

### Security Groups
- EC2: inbound rules for ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (Spring Boot), 3000 (MCP server)
- RDS: inbound rule for port 3306 (MySQL) from the EC2 security group only

---

## Design Goals / Approach

### Layered Backend Architecture
The backend follows a three-layer architecture — Controller → Service → Repository — which separates concerns cleanly. The controller handles HTTP requests, the service contains business logic, and the repository handles database access. This makes each layer independently testable and easier to maintain.

### Type Safety Across the Stack
TypeScript was chosen for the frontend to mirror the strong typing of Java on the backend. The `Employee` interface in TypeScript directly maps to the `Employee` entity in Java, meaning type mismatches between frontend and backend are caught early.

### Schema-Based Validation
Zod was used to define a validation schema that TypeScript can infer types from directly. This means the form data type (`EmployeeFormData`) and the validation rules live in one place — if the schema changes, the types update automatically.

### Single Form for Create and Edit
Rather than building two separate form pages, a single `EmployeeFormPage` handles both create and edit modes. It detects which mode it's in by checking for an `id` parameter in the URL (`useParams`). In edit mode, it pre-fills the form using React Hook Form's `reset()` function.

### AI Integration via MCP
The AI chatbot uses Model Context Protocol (MCP) — a standard developed by Anthropic that gives AI models a way to use tools to interact with real data. The MCP server defines tools like `get_workforce_summary`, `search_employees_by_name`, and `get_permanent_employees`. Claude reads the tool descriptions, decides which to call, the MCP server executes the query against RDS, and Claude writes a natural language answer. Only SELECT queries are permitted — dangerous keywords like DROP, DELETE, and INSERT are blocked.

---

## Features

- View all employees in a clean card-based list
- Add a new employee via a validated form
- Edit an existing employee with pre-filled form fields
- Delete an employee with confirmation via toast notification
- Form validation on all fields including Australian phone number format regex, email format, date logic (end date must be after start date), and max character limits
- Hours per week field conditionally appears only when Part Time basis is selected
- Duplicate email detection with user-facing error toast
- Custom exception handling returns appropriate HTTP status codes (404, 409, 500)
- Responsive layout with SCSS styling
- **AI HR Assistant** — floating chat widget powered by Claude Haiku and MCP. Ask natural language questions about employees such as "give me a workforce summary", "show me all permanent employees", or "search for Charlotte"

---

## Known Issues

- No confirmation dialog before deleting an employee — deletion is immediate
- The `hoursPerWeek` field uses `as any` type casting due to a type mismatch between the Zod schema and React Hook Form's resolver — functionally correct but not fully type-safe
- No pagination on the employee list — all employees load at once
- No authentication or authorisation — the API is publicly accessible
- EC2 has no Elastic IP — the public IP changes on instance restart, requiring the frontend `.env` to be updated and redeployed to S3

---

## Future Goals

- Add a confirmation modal before deleting an employee
- Add pagination or infinite scroll to the employee list
- Add search and filter functionality to the list page
- Add JWT authentication to protect the API
- Add HTTPS with a CloudFront distribution in front of S3 and an SSL certificate on EC2
- Assign an Elastic IP to EC2 so the public IP doesn't change on restart
- Register a custom domain with Route 53
- Move RDS credentials to AWS Secrets Manager
- Configure systemctl services so Spring Boot and the MCP server auto-restart on EC2 reboot
- Upgrade the AI model from Claude Haiku to Claude Sonnet for better reasoning on complex queries

---

## Change Logs

### February 2026 — Backend Foundation
Set up the Spring Boot project with MySQL integration. Created the `Employee` entity with JPA annotations, built the repository layer using Spring Data JPA, implemented the service layer with business logic including duplicate email validation, and created the REST controller with full CRUD endpoints. Added CORS configuration and global exception handling returning appropriate HTTP status codes.

### February 2026 — Frontend Foundation
Initialised the React TypeScript project with Vite. Set up React Router with three routes (list, create, edit). Built the `EmployeeListPage` with `useEffect` for data fetching and `useState` for local state. Extracted the `EmployeeCard` component for cleaner separation of concerns. Built the `EmployeeFormPage` with React Hook Form and Zod validation handling both create and edit modes from a single component.

### March 2026 — Styling & Polish
Applied SCSS styling to both pages. Added Font Awesome icons for the header, edit (pencil), and delete (trash) buttons. Integrated `react-hot-toast` for success and error notifications. Fixed the `hoursPerWeek` input using `valueAsNumber` to correctly pass numeric values to the Zod schema.

### March 2026 — AWS Deployment
Deployed the full application to AWS. React frontend hosted on S3 with static website hosting. Spring Boot backend packaged as a JAR and deployed to EC2 (Amazon Linux 2023, t4g.micro). MySQL database migrated to RDS with the EC2 security group whitelisted for private VPC access. Debugged and resolved several deployment issues including CORS configuration for the S3 origin, React Router S3 fallback configuration, EC2 memory limits requiring the `-Xmx512m` JVM flag, and RDS private accessibility requiring the MCP server to be deployed to EC2.

### March 2026 — AI Integration
Integrated an AI HR assistant using the Anthropic Claude API and Model Context Protocol (MCP). Built an Express/TypeScript MCP server with 10 tools covering workforce summaries, employee searches, contract type filtering, and custom SQL queries. Adapted the nology starter MCP server to match the app's flat `employees` table schema, replacing multi-table tools with schema-appropriate alternatives. Deployed the MCP server to the same EC2 instance as Spring Boot. Built a React chat widget component with conversation history, typing indicator, and tools-used display.

---

## What Did You Struggle With?

**TypeScript type mismatches between Zod and React Hook Form**
The `hoursPerWeek` field caused persistent TypeScript errors because Zod's `coerce.number()` was inferred as `unknown` rather than `number | undefined`, which React Hook Form's resolver couldn't accept. This was resolved by falling back to `z.number().optional()` combined with `valueAsNumber: true` on the input, and using `as any` on the resolver as a pragmatic workaround.

**CORS configuration**
Early API calls from the frontend failed silently because the backend was blocking requests from a different origin (port 5173 vs 8080). Understanding why the browser was blocking the requests and then configuring a `WebMvcConfigurer` bean in Spring to explicitly allow the frontend origin resolved the issue.

**Java Optional imports**
An early bug was caused by importing `Optional` from Google Guava instead of `java.util`. The methods had slightly different signatures which caused runtime errors that were difficult to trace back to the import statement.

**RDS connectivity from the MCP server**
The MCP server initially couldn't connect to RDS because the database was not publicly accessible — a network-level restriction separate from security group rules. The fix required enabling public accessibility on RDS and deploying the MCP server to EC2 so it connects through the private VPC, allowing RDS to be made private again.

**Claude Haiku hallucinating column names**
Claude Haiku would sometimes generate SQL with incorrect column names (e.g. `employment_type` instead of `contract_type`). This was fixed through prompt engineering — explicitly providing the exact schema column names and valid values in the system prompt.

---

## Licensing Details

This project is released under the MIT License.

---

## Further Details

Built as part of the _nology Full Stack Engineer Program (2026). This is an original project built from scratch following the program brief.

## Further Details

Built as part of the _nology Full Stack Engineer Program (2026). This is an original project built from scratch following the program brief.
