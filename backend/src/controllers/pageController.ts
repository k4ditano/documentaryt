import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Model } from 'sequelize';
import Page from '../models/Page';
import { ApiResponse, ErrorResponse } from '../types/api';
import { CustomError } from '../utils/customError';

interface PageAttributes {
  id: number;
  title: string;
  content: string | null;
  parent_id: number | null;
  user_id: number;
  position: number;
  tags: string;
  created_at: Date;
  updated_at: Date;
}

interface PageInstance extends Model<PageAttributes>, PageAttributes {}

interface PageRequest extends ExpressRequest<ParamsDictionary, any, any, ParsedQs> {
  body: {
    title?: string;
    content?: string;
    parent_id?: number | null;
    position?: number;
    tags?: string[];
  };
  params: {
    id?: string;
  };
  user?: {
    id: number;
  };
  emitUpdate?: (userId: number, event: string, data: any) => void;
}

interface Response extends ExpressResponse {
  status(code: number): this;
  json(body: ApiResponse | ErrorResponse): this;
}

interface PageResponse extends ApiResponse {
  data: PageAttributes | PageAttributes[];
}

const convertPageToAttributes = (page: PageInstance): PageAttributes => ({
  id: page.id,
  title: page.title,
  content: page.content,
  parent_id: page.parent_id,
  user_id: page.user_id,
  position: page.position,
  tags: Array.isArray(page.tags) ? JSON.stringify(page.tags) : page.tags,
  created_at: page.created_at,
  updated_at: page.updated_at
});

export const getPages = async (
  req: PageRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const pages = await Page.findAll({
      where: { user_id: userId },
      order: [['position', 'ASC']],
    });
    
    res.status(200).json({
      success: true,
      data: pages.map(page => convertPageToAttributes(page as PageInstance)),
    } as PageResponse);
  } catch (error) {
    next(error);
  }
};

export const createPage = async (
  req: PageRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { title, content, parent_id, position = 0, tags = [] } = req.body;
    
    if (!title) {
      throw new CustomError('El título es requerido', 400);
    }

    const page = await Page.create({
      title,
      content: content || null,
      parent_id: parent_id || null,
      user_id: userId,
      position,
      tags: JSON.stringify(tags),
    });

    const pageAttributes = convertPageToAttributes(page as PageInstance);

    // Notificar a través de WebSocket si está disponible
    if (req.emitUpdate) {
      req.emitUpdate(userId, 'page:created', { page: pageAttributes });
    }

    res.status(201).json({
      success: true,
      data: pageAttributes,
    } as PageResponse);
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (
  req: PageRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { id } = req.params;
    if (!id) {
      throw new CustomError('ID de página no proporcionado', 400);
    }

    const { title, content, parent_id, position, tags } = req.body;
    
    const page = await Page.findOne({
      where: { id, user_id: userId }
    });

    if (!page) {
      throw new CustomError('Página no encontrada', 404);
    }

    const updates: Partial<PageAttributes> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (parent_id !== undefined) updates.parent_id = parent_id;
    if (position !== undefined) updates.position = position;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);

    await page.update(updates);

    const pageAttributes = convertPageToAttributes(page as PageInstance);

    // Notificar a través de WebSocket si está disponible
    if (req.emitUpdate) {
      req.emitUpdate(userId, 'page:updated', { page: pageAttributes });
    }

    res.status(200).json({
      success: true,
      data: pageAttributes,
    } as PageResponse);
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (
  req: PageRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { id } = req.params;
    if (!id) {
      throw new CustomError('ID de página no proporcionado', 400);
    }
    
    const page = await Page.findOne({
      where: { id, user_id: userId }
    });

    if (!page) {
      throw new CustomError('Página no encontrada', 404);
    }

    await page.destroy();

    // Notificar a través de WebSocket si está disponible
    if (req.emitUpdate) {
      req.emitUpdate(userId, 'page:deleted', { id });
    }

    res.status(200).json({
      success: true,
      message: 'Página eliminada correctamente',
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
};

export const getPage = async (
  req: PageRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError('Usuario no autenticado', 401);
    }

    const { id } = req.params;
    if (!id) {
      throw new CustomError('ID de página no proporcionado', 400);
    }

    const page = await Page.findOne({
      where: { id, user_id: userId }
    });

    if (!page) {
      throw new CustomError('Página no encontrada', 404);
    }

    const pageAttributes = convertPageToAttributes(page as PageInstance);

    res.status(200).json({
      success: true,
      data: pageAttributes,
    } as PageResponse);
  } catch (error) {
    next(error);
  }
}; 