import {
  ApiErrorResponse,
  CreateMenuInput,
  MenuResponse,
  MenuTreeNode,
  MoveMenuInput,
  ReorderMenuInput,
  UpdateMenuInput,
} from '../types/menu';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorTitle: string;
  public readonly messages: string[];

  constructor(payload: ApiErrorResponse) {
    const msg = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || 'An error occurred';
    super(msg);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.errorTitle = payload.error || 'Error';
    this.messages = Array.isArray(payload.message)
      ? payload.message
      : [payload.message || 'An error occurred'];
  }
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError({
      statusCode: response.status,
      error: data.error || response.statusText,
      message: data.message || `Request failed with status ${response.status}`,
      path: data.path || endpoint,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  }

  return data as T;
}

export const menuApi = {
  getTree(signal?: AbortSignal): Promise<MenuTreeNode[]> {
    return request<MenuTreeNode[]>('/menus', { method: 'GET', signal });
  },

  getMenu(id: string, signal?: AbortSignal): Promise<MenuResponse> {
    return request<MenuResponse>(`/menus/${id}`, { method: 'GET', signal });
  },

  createMenu(
    input: CreateMenuInput,
    signal?: AbortSignal,
  ): Promise<MenuResponse> {
    return request<MenuResponse>('/menus', {
      method: 'POST',
      body: JSON.stringify(input),
      signal,
    });
  },

  updateMenu(
    id: string,
    input: UpdateMenuInput,
    signal?: AbortSignal,
  ): Promise<MenuResponse> {
    return request<MenuResponse>(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
      signal,
    });
  },

  deleteMenu(id: string, signal?: AbortSignal): Promise<void> {
    return request<void>(`/menus/${id}`, {
      method: 'DELETE',
      signal,
    });
  },

  moveMenu(
    id: string,
    input: MoveMenuInput,
    signal?: AbortSignal,
  ): Promise<MenuResponse> {
    return request<MenuResponse>(`/menus/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      signal,
    });
  },

  reorderMenu(
    id: string,
    input: ReorderMenuInput,
    signal?: AbortSignal,
  ): Promise<MenuResponse> {
    return request<MenuResponse>(`/menus/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      signal,
    });
  },
};
