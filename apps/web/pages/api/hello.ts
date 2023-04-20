import { createSqlAgent, SqlToolkit } from 'langchain/agents';
import { OpenAI } from 'langchain/llms/openai';
import { SqlDatabase } from 'langchain/sql_db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { DataSource } from 'typeorm';

type Data = {
  output?: any;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // Make it a post request
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { prompt } = req.body;

  console.log(req.body);

  const datasource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 6643,
    username: '',
    password: '',
    database: 'postgres',
  });

  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
  const toolkit = new SqlToolkit(db);
  const model = new OpenAI({ temperature: 0.7 });
  const executor = createSqlAgent(model, toolkit);

  const rules = `
    rules:
    - ignore deleted sql rows
    - don't set SQL limit
    - For column owner_user_id in the tokens table, refer to the username column in the users table
    - For column contract in the tokens table, refer to the address column in the contracts table
  `;

  const input = prompt + ' ' + rules;

  console.log(`Executing with input "${input}"...`);

  const result = await executor.call({ input });

  await datasource.destroy();

  res.status(200).json({ output: result });
}
