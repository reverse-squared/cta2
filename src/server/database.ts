import r, { Operation } from 'rethinkdb';

const DB_NAME = 'cta2';

export let connection: r.Connection;

export async function connectToDatabase() {
  connection = await r.connect({ host: 'localhost', port: 28015 });

  if (!(await r.dbList().run(connection)).includes(DB_NAME)) {
    await r.dbCreate(DB_NAME).run(connection);
  }

  async function createTable(name: string, options: r.TableOptions, secondaryIndexes: string[]) {
    const existingTables = await r
      .db('cta2')
      .tableList()
      .run(connection);

    if (!existingTables.includes(name)) {
      const tableQuery = r.db('cta2').tableCreate(name, ...[options].filter((x) => x));
      await tableQuery.run(connection);
      if (secondaryIndexes) {
        await Promise.all(
          secondaryIndexes.map((index: string) =>
            r
              .db('cta2')
              .table(name)
              .indexCreate(index)
              .run(connection)
          )
        );
      }
    }
  }

  await createTable('scenes', {}, ['type']);
  await createTable('requests', { primary_key: 'uuid' }, ['id']);
  await createTable('sources', { primary_key: 'id' }, []);
}

export function ctaDb() {
  return r.db(DB_NAME);
}
export async function runDb<T>(operation: Operation<T>): Promise<T> {
  if (!connection) {
    throw new Error('Connection not established. Please Wait.');
  }
  return operation.run(connection);
}
