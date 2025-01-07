import express from 'express';
import Page from '../models/Page';

export const getPages = async (req: express.Request, res: express.Response) => {
  try {
    const pages = await Page.findAll({
      order: [['position', 'ASC']],
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las páginas' });
  }
};

export const createPage = async (req: express.Request, res: express.Response) => {
  try {
    const { title, content, parent_id, position, tags } = req.body;
    const page = await Page.create({
      title,
      content,
      parent_id,
      position,
      tags: tags ? JSON.stringify(tags) : '[]',
    } as any);
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la página' });
  }
};

export const updatePage = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, content, parent_id, position, tags } = req.body;
    
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (parent_id !== undefined) updates.parent_id = parent_id;
    if (position !== undefined) updates.position = position;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);

    await page.update(updates);
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la página' });
  }
};

export const deletePage = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    await page.destroy();
    res.json({ message: 'Página eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la página' });
  }
};

export const getPage = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: 'Página no encontrada' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la página' });
  }
}; 