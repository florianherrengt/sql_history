import {
    Model,
    Column,
    PrimaryKey,
    HasMany,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    Default,
    DataType,
    BeforeUpdate,
    Sequelize
} from "sequelize-typescript";
import { Note } from "./Note.model";

interface NotebookAttributes {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

class Notebook extends Model<Notebook> implements NotebookAttributes {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column
    id: string;

    @Column
    name: string;

    @HasMany(() => Note)
    notes: Note[];

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @DeletedAt
    deletedAt: Date;

    @BeforeUpdate
    static async updateHistory(instance: Notebook) {
        const old = await Notebook.findByPk(instance.id);
        await new NotebookHistory(old!.toJSON()).save();
    }

    static async getAtDate(instance: Notebook, date: Date) {
        const history = await NotebookHistory.findOne({
            where: { id: instance.id, createdAt: { [Sequelize.Op.lte]: date } },
            order: [["updatedAt", "DESC"]]
        });
        if (instance.deletedAt > date && !history) {
            return instance
        }
        return history || instance;
    }
}

class NotebookHistory extends Model<NotebookHistory>
    implements NotebookAttributes {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column
    _id: string;

    @Column
    id: string;

    @Column
    name: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export { Notebook, NotebookHistory };
