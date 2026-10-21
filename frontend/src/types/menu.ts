export interface MenuTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  position: number;
  children: MenuTreeNode[];
}

export interface MenuResponse {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  depth: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateMenuInput {
  name: string;
}

export interface MoveMenuInput {
  parentId: string | null;
  position?: number;
}

export interface ReorderMenuInput {
  position: number;
}

export type FormMode = 'edit' | 'create';

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}
