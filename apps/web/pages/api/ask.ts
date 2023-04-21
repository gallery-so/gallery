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
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { prompt } = req.body;

  const datasource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) ?? 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
      ignoreTables: [
        'dev_metadata_users',
        'early_access',
        'feed_blocklist',
        'legacy_views',
        'lock_monitor',
        'marketplace_contracts',
        'membership',
        'merch',
        'nonces',
        'notifications',
        'recommendation_results',
        'schema_migrations',
      ],
    });
    const toolkit = new SqlToolkit(db);
    const model = new OpenAI({ temperature: 0 });
    const executor = createSqlAgent(model, toolkit);

    const rules = `rules:
    	- ignore deleted sql rows
    	- don't set SQL limit
    	- For column owner_user_id in the tokens table, refer to the id column in the users table
      - token and nft is the same thing
	`;
    const input = prompt + ' ' + rules;

    console.log(`Executing with input "${input}"...`);

    const result = await executor.call({ input });

    await datasource.destroy();

    res.status(200).json({ output: result });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
