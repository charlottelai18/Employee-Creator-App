import { getPool } from './config/database';
import { GLOSSARY } from './glossary';
import { ToolName } from './tools';
import {
  MCPResponse,
  EnrichedEmployee,
} from './types';

export const handleGetGlossary = async (): Promise<MCPResponse> => {
  const glossaryText = Object.entries(GLOSSARY)
    .map(([term, definition]) => `**${term}**: ${definition}`)
    .join('\n\n');

  return {
    content: [{ type: 'text', text: `# HR Database Glossary\n\n${glossaryText}` }],
  };
};

export const handleShowTables = async (): Promise<MCPResponse> => {
  const pool = getPool();
  const [rows] = await pool.query('SHOW TABLES');
  const tableNames = (rows as any[]).map((row) => Object.values(row)[0]);
  return {
    content: [{ type: 'text', text: `# Available Tables\n\n${tableNames.join('\n')}` }],
  };
};

export const handleDescribeTable = async (tableName: string): Promise<MCPResponse> => {
  const pool = getPool();
  const validTables = ['employees'];
  if (!validTables.includes(tableName)) {
    throw new Error(`Invalid table name. Must be one of: ${validTables.join(', ')}`);
  }
  const [rows] = await pool.query(`DESCRIBE ${tableName}`);
  const description = (rows as any[])
    .map((row) =>
      `- **${row.Field}** (${row.Type}): ${row.Null === 'YES' ? 'Nullable' : 'Not Null'}${row.Key ? `, Key: ${row.Key}` : ''}${row.Extra ? `, ${row.Extra}` : ''}`
    )
    .join('\n');
  return {
    content: [{ type: 'text', text: `# Table: ${tableName}\n\n${description}` }],
  };
};

export const handleRunQuery = async (query: string): Promise<MCPResponse> => {
  const pool = getPool();
  const trimmedQuery = query.trim().toUpperCase();
  console.log('Query ran: ', trimmedQuery);
  if (!trimmedQuery.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }
  const dangerousKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'TRUNCATE'];
  if (dangerousKeywords.some((keyword) => trimmedQuery.includes(keyword))) {
    throw new Error('Query contains forbidden keywords');
  }
  const [rows] = await pool.query(query);
  return {
    content: [{ type: 'text', text: `# Query Results\n\n\`\`\`json\n${JSON.stringify(rows, null, 2)}\n\`\`\`` }],
  };
};

// Get all permanent employees
export const handleGetPermanentEmployees = async (): Promise<MCPResponse> => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, email, start_date, basis, hours_per_week
     FROM employees
     WHERE contract_type = 'PERMANENT'
     ORDER BY start_date ASC`
  );
  const results = rows as any[];
  if (!results.length) {
    return { content: [{ type: 'text', text: 'No permanent employees found.' }] };
  }
  const list = results
    .map((e) => `- **${e.first_name} ${e.last_name}** (ID: ${e.id}) — ${e.basis}, ${e.hours_per_week}hrs/week, started ${e.start_date}`)
    .join('\n');
  return {
    content: [{ type: 'text', text: `# Permanent Employees (${results.length} total)\n\n${list}` }],
  };
};

// Get all full-time employees
export const handleGetFullTimeEmployees = async (): Promise<MCPResponse> => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, email, contract_type, start_date, hours_per_week
     FROM employees
     WHERE basis = 'FULL_TIME'
     ORDER BY start_date ASC`
  );
  const results = rows as any[];
  if (!results.length) {
    return { content: [{ type: 'text', text: 'No full-time employees found.' }] };
  }
  const list = results
    .map((e) => `- **${e.first_name} ${e.last_name}** (ID: ${e.id}) — ${e.contract_type}, ${e.hours_per_week}hrs/week, started ${e.start_date}`)
    .join('\n');
  return {
    content: [{ type: 'text', text: `# Full-Time Employees (${results.length} total)\n\n${list}` }],
  };
};

// Get most recently hired employees
export const handleGetRecentStarters = async (limit = 5): Promise<MCPResponse> => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, email, contract_type, start_date, basis
     FROM employees
     ORDER BY start_date DESC
     LIMIT ?`,
    [limit || 5]
  );
  const results = rows as any[];
  if (!results.length) {
    return { content: [{ type: 'text', text: 'No employees found.' }] };
  }
  const list = results
    .map((e) => `- **${e.first_name} ${e.last_name}** (ID: ${e.id}) — started ${e.start_date}, ${e.contract_type}, ${e.basis}`)
    .join('\n');
  return {
    content: [{ type: 'text', text: `# Most Recently Hired Employees\n\n${list}` }],
  };
};

// Get workforce summary
export const handleGetWorkforceSummary = async (): Promise<MCPResponse> => {
  const pool = getPool();
  const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM employees`);
  const [contractRows] = await pool.query(
    `SELECT contract_type, COUNT(*) as count FROM employees GROUP BY contract_type`
  );
  const [basisRows] = await pool.query(
    `SELECT basis, COUNT(*) as count FROM employees GROUP BY basis`
  );
  const [activeRows] = await pool.query(
    `SELECT COUNT(*) as active FROM employees WHERE end_date IS NULL OR end_date > CURDATE()`
  );

  const total = (totalRows as any[])[0].total;
  const active = (activeRows as any[])[0].active;
  const contractBreakdown = (contractRows as any[])
    .map((r) => `  - ${r.contract_type}: ${r.count}`)
    .join('\n');
  const basisBreakdown = (basisRows as any[])
    .map((r) => `  - ${r.basis}: ${r.count}`)
    .join('\n');

  return {
    content: [{
      type: 'text',
      text: `# Workforce Summary\n\n**Total Employees**: ${total}\n**Currently Active**: ${active}\n\n**By Contract Type**:\n${contractBreakdown}\n\n**By Employment Basis**:\n${basisBreakdown}`
    }],
  };
};

// Get employee by ID via Spring Boot API
export const handleGetEmployeeById = async (id: number): Promise<MCPResponse> => {
  try {
    const res = await fetch(`http://localhost:8080/api/employees/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch employee with ID ${id}`);
    const employee = (await res.json()) as EnrichedEmployee;
    if (!employee) {
      return { content: [{ type: 'text', text: `No employee found with ID ${id}.` }] };
    }
    const resultText = `# Employee Details

**ID**: ${employee.id}
**Name**: ${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''} ${employee.lastName}
**Email**: ${employee.email ?? 'N/A'}
**Phone**: ${employee.phone ?? 'N/A'}
**Address**: ${employee.address ?? 'N/A'}
**Contract Type**: ${employee.contractType ?? 'N/A'}
**Employment Basis**: ${employee.basis ?? 'N/A'}
**Hours Per Week**: ${employee.hoursPerWeek ?? 'N/A'}
**Start Date**: ${employee.startDate ?? 'N/A'}
**End Date**: ${employee.endDate ?? 'Ongoing'}`;

    return { content: [{ type: 'text', text: resultText }] };
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error fetching employee with ID ${id}: ${err.message}` }],
    };
  }
};

// Search employees by name via Spring Boot API
export const handleSearchEmployeesByName = async (name: string): Promise<MCPResponse> => {
  try {
    const pool = getPool();
    const searchTerm = `%${name}%`;
    const [rows] = await pool.query(
      `SELECT id, first_name, middle_name, last_name, email, contract_type, basis, start_date
       FROM employees
       WHERE first_name LIKE ? OR last_name LIKE ? OR middle_name LIKE ?`,
      [searchTerm, searchTerm, searchTerm]
    );
    const results = rows as any[];
    if (!results.length) {
      return { content: [{ type: 'text', text: `No employees found matching "${name}".` }] };
    }
    const list = results
      .map((e) => `- **${e.first_name} ${e.middle_name ? e.middle_name + ' ' : ''}${e.last_name}** (ID: ${e.id}) — ${e.email}, ${e.contract_type}, ${e.basis}, started ${e.start_date}`)
      .join('\n');
    return {
      content: [{ type: 'text', text: `# Employees matching "${name}" (${results.length} found)\n\n${list}` }],
    };
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error searching employees: ${err.message}` }],
    };
  }
};

// Helper function to execute a tool by name
export const executeTool = async (
  toolName: ToolName,
  args: Record<string, any> = {}
): Promise<MCPResponse> => {
  switch (toolName as ToolName) {
    case 'get_glossary':
      return await handleGetGlossary();
    case 'show_tables':
      return await handleShowTables();
    case 'describe_table':
      if (!args.table_name) throw new Error('table_name argument is required');
      return await handleDescribeTable(args.table_name);
    case 'run_query':
      if (!args.query) throw new Error('query argument is required');
      return await handleRunQuery(args.query);
    case 'get_permanent_employees':
      return await handleGetPermanentEmployees();
    case 'get_fulltime_employees':
      return await handleGetFullTimeEmployees();
    case 'get_recent_starters':
      return await handleGetRecentStarters(args.limit);
    case 'get_workforce_summary':
      return await handleGetWorkforceSummary();
    case 'get_employee_by_id':
      if (!args.id) throw new Error('id argument is required');
      return await handleGetEmployeeById(args.id);
    case 'search_employees_by_name':
      if (!args.name) throw new Error('name argument is required');
      return await handleSearchEmployeesByName(args.name);
    default:
      throw new Error(`Tool '${toolName}' not found`);
  }
};