"use client";

import { useState, useCallback, useEffect } from 'react';
import { imageUploadService, ImageFile } from '@/lib/imageUploadService';

interface UseSupabaseImagesOptions {
  prefix?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseSupabaseImagesReturn {
  images: ImageFile[];
  loading: boolean;
  error: string | null;
  fetchImages: (page?: number) => Promise<void>;
  uploadImage: (file: File, type?: 'posts' | 'covers') => Promise<string>;
  searchImages: (query: string) => Promise<void>;
  totalPages: number;
  currentPage: number;
  totalImages: number;
  hasMore: boolean;
  refreshImages: () => Promise<void>;
}

export function useSupabaseImages(
  options: UseSupabaseImagesOptions = {}
): UseSupabaseImagesReturn {
  const {
    prefix = 'posts/',
    pageSize = 20,
    autoFetch = true,
  } = options;

  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Cache de resultados para evitar re-fetches desnecessários
  const [cache, setCache] = useState<Map<string, { files: ImageFile[]; total: number }>>(
    new Map()
  );

  const totalPages = Math.ceil(totalImages / pageSize);
  const hasMore = currentPage < totalPages;

  /**
   * Gera chave de cache baseada nos parâmetros
   */
  const getCacheKey = useCallback(
    (page: number, search: string) => {
      return `${prefix}_${page}_${search}`;
    },
    [prefix]
  );

  /**
   * Busca imagens do Supabase ou cache
   */
  const fetchImages = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * pageSize;
        const cacheKey = getCacheKey(page, searchQuery);

        // Verificar cache primeiro
        const cached = cache.get(cacheKey);
        if (cached) {
          setImages(cached.files);
          setTotalImages(cached.total);
          setCurrentPage(page);
          setLoading(false);
          return;
        }

        // Buscar do Supabase
        const result = await imageUploadService.listImages({
          prefix,
          limit: pageSize,
          offset,
          search: searchQuery,
        });

        // Atualizar cache
        setCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, result);
          return newCache;
        });

        setImages(result.files);
        setTotalImages(result.total);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar imagens';
        setError(errorMessage);
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    },
    [prefix, pageSize, searchQuery, cache, getCacheKey]
  );

  /**
   * Faz upload de uma imagem
   */
  const uploadImage = useCallback(
    async (file: File, type: 'posts' | 'covers' = 'posts'): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const url = await imageUploadService.uploadImage(file, type);

        // Limpar cache para forçar refresh
        setCache(new Map());

        // Recarregar página atual
        await fetchImages(currentPage);

        return url;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchImages, currentPage]
  );

  /**
   * Busca imagens por nome
   */
  const searchImages = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      setCache(new Map()); // Limpar cache ao buscar

      setLoading(true);
      setError(null);

      try {
        const result = await imageUploadService.listImages({
          prefix,
          limit: pageSize,
          offset: 0,
          search: query,
        });

        setImages(result.files);
        setTotalImages(result.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar imagens';
        setError(errorMessage);
        console.error('Error searching images:', err);
      } finally {
        setLoading(false);
      }
    },
    [prefix, pageSize]
  );

  /**
   * Recarrega as imagens (limpa cache)
   */
  const refreshImages = useCallback(async () => {
    setCache(new Map());
    await fetchImages(currentPage);
  }, [fetchImages, currentPage]);

  /**
   * Auto-fetch ao montar o componente
   */
  useEffect(() => {
    if (autoFetch) {
      fetchImages(1);
    }
  }, [autoFetch]); // Não incluir fetchImages para evitar loop

  return {
    images,
    loading,
    error,
    fetchImages,
    uploadImage,
    searchImages,
    totalPages,
    currentPage,
    totalImages,
    hasMore,
    refreshImages,
  };
}



