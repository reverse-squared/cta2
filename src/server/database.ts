import r from 'rethinkdb';

export let connection: r.Connection;

export async function connectToDatabase() {
  connection = await r.connect({ host: 'localhost', port: 28015, db: 'cta2' });

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

  await createTable('scenes', { primary_key: 'sceneName' }, ['type']);
  await createTable('suggestion', { primary_key: 'sceneName' }, []);
}
