import {
    Model,
    Column,
    PrimaryKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    ForeignKey,
    Default,
    DataType,
    BeforeUpdate,
    Sequelize
} from "sequelize-typescript";
import { Notebook } from "./Notebook.model";

interface NoteAttributes {
    id: string;
    text: string;
    notebookId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

class Note extends Model<Note> implements NoteAttributes {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column
    id: string;

    @Column
    text: string;

    @ForeignKey(() => Notebook)
    notebookId: string;

    @BelongsTo(() => Notebook)
    notebook: Notebook;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @DeletedAt
    deletedAt: Date;

    @BeforeUpdate
    static async updateHistory(instance: Note) {
        const old = await Note.findByPk(instance.id);
        await new NoteHistory(old!.toJSON()).save();
    }

    static async getAtDate(instance: Note, date: Date) {
        const history = await NoteHistory.findOne({
            where: { id: instance.id, createdAt: { [Sequelize.Op.lte]: date } },
            order: [["updatedAt", "DESC"]]
        });
        if (instance.deletedAt > date && !history) {
            return instance
        }
        return history || instance;
    }
}

class NoteHistory extends Model<NoteHistory> implements NoteAttributes {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column
    _id: string;

    @Column
    id: string;

    @Column
    text: string;

    @Column
    notebookId: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @DeletedAt
    deletedAt: Date;
}

export { Note, NoteHistory };
