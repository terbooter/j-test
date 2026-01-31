import {
  createBlock,
  deleteBlock,
  deleteBlockChilds,
  findById,
  findByLink,
  findByParent,
  findByWorkspace,
  updateContentBlock,
} from '../db/blocks/query';
import { TDatabaseConnection } from '../db/connection';
import { TBlock } from '../db/schema';
import { TBlockContentType, TBlockType } from '../types/block';

export class BlockValidationError extends Error {
  constructor(
    message: string,
    public code: 'invalid_content' | 'invalid_type'
  ) {
    super(message);
    this.name = 'BlockValidationError';
  }
}

export class BlockMoveError extends Error {
  constructor(
    message: string,
    public code = 'invalid_content'
  ) {
    super(message);
    this.name = 'BlockMoveError';
  }
}

export class BlockService {
  constructor(private db: Promise<TDatabaseConnection>) {}

  createCursor(block: TBlock): string {
    return `${block.order}:${block.id}`;
  }

  parseCursor(cursor: string): { order: number; id: string } | null {
    if (cursor.length === 0) return null;

    const parts = cursor.split(':');
    if (parts.length !== 2) return null;

    const [orderStr, id] = parts;
    if (orderStr === undefined || id === undefined) return null;

    const order = parseInt(orderStr, 10);

    if (isNaN(order) || id.length === 0) return null;

    return { order, id };
  }

  async create(data: {
    parent: string | null;
    order?: number;
    type: TBlockType;
    content: TBlockContentType;
  }): Promise<TBlock | null> {
    // Валидируем соответствие контента типу блока
    if (!this.isValidContentForType(data.type, data.content)) {
      throw new BlockValidationError(
        `Content format does not match block type '${data.type}'`,
        'invalid_content'
      );
    }

    try {
      const block = await createBlock(await this.db, {
        parent: data.parent,
        childs: 0,
        totalChilds: 0,
        order: data.order ?? 0,
        type: data.type,
        content: data.content,
      });
      return block;
    } catch (error) {
      throw new Error(`Failed to create block: ${error}`);
    }
  }

  /**
   * Получение блока по ID
   */
  async getById(id: string): ReturnType<Awaited<typeof findById>> {
    try {
      const block = await findById(await this.db, id);

      return block;
    } catch (error) {
      throw new Error(`Failed to get block: ${error}`);
    }
  }

  async getByWorkspace(
    cursor?: string
  ): ReturnType<Awaited<typeof findByWorkspace>> {
    try {
      const parsedCursor = this.parseCursor(cursor ?? '');
      const blocks = await findByWorkspace(await this.db, parsedCursor);
      return blocks;
    } catch (error) {
      throw new Error(`Failed to get blocks: ${error}`);
    }
  }

  async getByParent(
    parentId: string,
    cursor?: string
  ): ReturnType<Awaited<typeof findByWorkspace>> {
    try {
      const parsedCursor = this.parseCursor(cursor ?? '');
      const blocks = await findByParent(await this.db, parentId, parsedCursor);
      return blocks;
    } catch (error) {
      throw new Error(`Failed to get blocks: ${error}`);
    }
  }

  async getByLink(link: string): Promise<TBlock | null> {
    try {
      const block = await findByLink(await this.db, link);
      return block;
    } catch (error) {
      throw new Error(`Failed to get block by link: ${error}`);
    }
  }

  /**
   * Обновление блока
   */
  async updateContent(
    block: TBlock,
    data: Pick<TBlock, 'content'>
  ): Promise<TBlock | null> {
    if (data.content !== undefined) {
      if (!this.isValidContentForType(block.type, data.content)) {
        throw new BlockValidationError(
          `Content format does not match block type '${block.type}'`,
          'invalid_content'
        );
      }
    }

    try {
      return await updateContentBlock(await this.db, block.id, data);
    } catch (error) {
      throw new Error(`Failed to update block: ${error}`);
    }
  }

  async delete(block: TBlock): Promise<boolean> {
    try {
      return (await deleteBlock(await this.db, block.id)) > 0;
    } catch (error) {
      throw new Error(`Failed to delete block: ${error}`);
    }
  }

  async deleteChilds(parent: TBlock): Promise<boolean> {
    try {
      return (await deleteBlockChilds(await this.db, parent.id)) > 0;
    } catch (error) {
      throw new Error(`Failed to delete block: ${error}`);
    }
  }

  isValidBlockContent(content: unknown): content is TBlockContentType {
    if (content === null || typeof content !== 'object') return false;

    if (
      'body' in content &&
      typeof (content as { body: unknown }).body === 'string' &&
      !('title' in content)
    ) {
      return true;
    }

    if (
      'title' in content &&
      'body' in content &&
      typeof (content as { title: unknown }).title === 'string' &&
      typeof (content as { body: unknown }).body === 'string'
    ) {
      return true;
    }

    if (
      'title' in content &&
      'items' in content &&
      typeof (content as { title: unknown }).title === 'string' &&
      Array.isArray((content as { items: unknown }).items)
    ) {
      return (content as { items: unknown[] }).items.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          'text' in item &&
          'completed' in item &&
          typeof (item as { text: unknown }).text === 'string' &&
          typeof (item as { completed: unknown }).completed === 'boolean'
      );
    }

    return false;
  }

  isValidContentForType(
    type: TBlockType,
    content: unknown
  ): content is TBlockContentType {
    if (content === null || typeof content !== 'object') return false;

    switch (type) {
      case 'idea':
        // Для idea: обязательно body, опционально image и template, НЕ должно быть title
        return (
          'body' in content &&
          typeof (content as { body: unknown }).body === 'string' &&
          !('title' in content) &&
          !('items' in content)
        );

      case 'article':
        // Для article: обязательно title и body, опционально image
        return (
          'title' in content &&
          'body' in content &&
          typeof (content as { title: unknown }).title === 'string' &&
          typeof (content as { body: unknown }).body === 'string' &&
          !('items' in content)
        );

      case 'checklist':
        // Для checklist: обязательно title и items
        return (
          'title' in content &&
          'items' in content &&
          typeof (content as { title: unknown }).title === 'string' &&
          Array.isArray((content as { items: unknown }).items) &&
          (content as { items: unknown[] }).items.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'text' in item &&
              'completed' in item &&
              typeof (item as { text: unknown }).text === 'string' &&
              typeof (item as { completed: unknown }).completed === 'boolean'
          ) &&
          !('body' in content)
        );

      default:
        return false;
    }
  }
}
