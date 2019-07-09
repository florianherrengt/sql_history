import { sequelize } from "./sequelize";
import { Notebook, NotebookHistory } from "./models/Notebook.model";

describe("Notebook", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });
  it("should soft delete a notebook", async () => {
    const notebook = await new Notebook({
      name: "First notebook"
    }).save();
    await notebook.destroy();
    expect(
      (await Notebook.findByPk(notebook.id, { paranoid: false }))!.deletedAt
    ).toBeDefined();
  });
  it("should update the notebook history", async () => {
    const notebook = await new Notebook({
      name: "First notebook"
    }).save();
    notebook.name = "Updated notebook";
    await notebook.save();
    expect(
      (await NotebookHistory.findOne({ where: { id: notebook.id } }))!.name
    ).toEqual("First notebook");
  });
  describe("history", () => {
    it("should return the same instance if unedited", async () => {
      const date = new Date();
      const notebook = await new Notebook({
        name: "Original notebook"
      }).save();
      expect((await Notebook.getAtDate(notebook, date))!).toBe(notebook);
    });
    it("should return the instance from history if edited", async () => {
      const notebook = await new Notebook({
        name: "Original notebook"
      }).save();
      await new Promise(resolve => setTimeout(resolve, 100));
      const date = new Date();
      notebook.name = "edited";
      await notebook.save();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect((await Notebook.getAtDate(notebook, date))!.name).toBe(
        "Original notebook"
      );
      await new Promise(resolve => setTimeout(resolve, 100));
      const date2 = new Date();
      await new Promise(resolve => setTimeout(resolve, 100));
      notebook.name = "edited again";
      await notebook.save();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect((await Notebook.getAtDate(notebook, date2))!.name).toBe("edited");
      expect((await Notebook.findByPk(notebook.id))!.name).toBe("edited again");
    });
  });
});
