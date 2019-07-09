# Data history with a SQL database

## Storing the data

Each table has an identical historical table.

```
Notebook -> NotebookHistory
Note -> NoteHistory
```

## Retriving the data

Based on `createdAt`, `updatedAt` and `deletedAt` we know where to get the data from.

More info in [index.spec.ts](./src/index.spec.ts)
