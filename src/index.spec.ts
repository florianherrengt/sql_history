import { sequelize } from "./sequelize";
import { Notebook, NotebookHistory } from "./models/Notebook.model";
import { Note, NoteHistory } from "./models/Note.model";
import { Sequelize } from "sequelize-typescript";

describe("Notebook and Note interaction", () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });
    it("should retrieve the full history at a given point", async () => {
        const notebook1 = await new Notebook({ name: "Fist notebook" }).save();
        const note1 = await new Note({
            text: "My original note",
            notebookId: notebook1.id
        }).save();
        const note2 = await new Note({
            text: "My second note",
            notebookId: notebook1.id
        }).save();
        const note3 = await new Note({
            text: "My third note",
            notebookId: notebook1.id
        }).save();

        await new Promise(resolve => setTimeout(resolve, 100));
        note1.text = 'go back to this point'
        await note1.save()


        const date = new Date();

        // rename notebook1
        notebook1.name = "Another name";
        await notebook1.save();

        // move note1 to another notebook
        const notebook2 = await new Notebook({ name: "Second notebook" }).save();
        note1.notebookId = notebook2.id;
        await note1.save();

        // rename change note2
        note2.text = "Edit the text";
        await note2.save();

        // delete note3
        await note3.destroy();

        // add another note
        const note4 = await new Note({
            text: "note added after",
            notebookId: notebook1.id
        }).save();
        await new Promise(resolve => setTimeout(resolve, 100));
        note4.text = 'note added after [edited]'
        await note4.save()

        // make sure everything has been saved correctly
        expect(
            (await Notebook.findByPk(notebook1.id, { include: [Note] }))!.name
        ).toEqual("Another name");
        expect(
            (await Notebook.findByPk(notebook1.id, { include: [Note] }))!.notes[0]
                .text
        ).toEqual("Edit the text");

        // finally delete the notebook
        await new Promise(resolve => setTimeout(resolve, 1000));
        await notebook1.destroy();

        // now, let's get the notebook as it was before the changes
        const notebooks = await Notebook.findAll({
            paranoid: false,
            where: {
                [Sequelize.Op.or]: [{
                    deletedAt: null,

                }, {
                    deletedAt: {
                        [Sequelize.Op.gte]: date
                    }
                }]
            },
        });

        // make sure all the notebooks are here
        expect([notebooks[0].name, notebooks[1].name]).toContain('Another name')
        expect([notebooks[0].name, notebooks[1].name]).toContain('Second notebook')

        // the notes currently attached to notebook1
        const currentNotes = await Note.findAll({ where: { notebookId: notebooks[0].id, createdAt: { [Sequelize.Op.lte]: date } }, paranoid: false })
        const currentNotesHistory = await Promise.all(currentNotes.map(n => Note.getAtDate(n, date)))
        const currentNotesIds = currentNotes.map(n => n.id)
        // the notes from the history (e.g if moved to another notebook)
        const notesHistory = await NoteHistory.findAll({ where: { notebookId: notebooks[0].id, updatedAt: { [Sequelize.Op.gte]: date }, createdAt: { [Sequelize.Op.lte]: date } } })
        const notes = [...currentNotesHistory, ...notesHistory.filter(n => !currentNotesIds.includes(n.id))]

        expect(notes).toHaveLength(3)
        expect(notes.map(n => n.text)).toContain('go back to this point')
        expect(notes.map(n => n.text)).toContain("My second note")
        expect(notes.map(n => n.text)).toContain("My third note")
    });
});
