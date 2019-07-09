import { Sequelize } from "sequelize-typescript";
import { Notebook, NotebookHistory } from "./models/Notebook.model";
import { Note, NoteHistory } from "./models/Note.model";

const sequelize = new Sequelize({
  logging: false,
  dialect: "sqlite",
  storage: ":memory:"
});

sequelize.addModels([Notebook, NotebookHistory, Note, NoteHistory]);

export { sequelize };
