import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface ImageFile {
  name: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
  formattedSize: string;
  formattedDate: string;
}

interface ListImagesOptions {
  prefix?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

interface ListImagesResult {
  files: ImageFile[];
  total: number;
}

export const imageUploadService = {
  /**
   * Valida um arquivo de imagem
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use: JPG, PNG, GIF ou WEBP',
      };
    }

    // Verificar tamanho (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB em bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 3MB',
      };
    }

    return { valid: true };
  },

  /**
   * Sanitiza o nome do arquivo removendo caracteres especiais
   */
  sanitizeFilename(filename: string): string {
    // Remove extensão temporariamente
    const ext = filename.substring(filename.lastIndexOf('.'));
    let name = filename.substring(0, filename.lastIndexOf('.'));

    // Remove caracteres especiais e espaços
    name = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Substitui caracteres especiais por _
      .replace(/_+/g, '_') // Remove múltiplos underscores
      .toLowerCase();

    return `${name}${ext}`;
  },

  /**
   * Gera o path organizado por tipo e data
   */
  generatePath(filename: string, type: 'posts' | 'covers' = 'posts'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime();
    const sanitized = this.sanitizeFilename(filename);

    return `${type}/${year}/${month}/${timestamp}_${sanitized}`;
  },

  /**
   * Faz upload de uma imagem para o Supabase Storage
   */
  async uploadImage(file: File, type: 'posts' | 'covers' = 'posts'): Promise<string> {
    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase não está configurado. Configure as variáveis de ambiente.');
    }

    // Validar arquivo
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Gerar path
    const path = this.generatePath(file.name, type);

    // Upload para Supabase
    const { error: uploadError } = await supabase.storage
      .from('imagens-site')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const url = this.getPublicUrl(path);
    return url;
  },

  /**
   * Obtém a URL pública de uma imagem
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from('imagens-site').getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Formata o tamanho do arquivo em formato legível
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Formata a data em formato legível
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  },

  /**
   * Lista imagens do bucket com filtros e paginação
   */
  async listImages(options: ListImagesOptions = {}): Promise<ListImagesResult> {
    const {
      prefix = 'posts/',
      limit = 20,
      offset = 0,
      search = '',
    } = options;

    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      return { files: [], total: 0 };
    }

    try {
      // Listar todos os arquivos no prefix (Supabase não suporta paginação direta)
      const { data, error } = await supabase.storage
        .from('imagens-site')
        .list(prefix, {
          limit: 1000, // Limite alto para pegar todos
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('List error:', error);
        throw new Error(`Erro ao listar imagens: ${error.message}`);
      }

      if (!data) {
        return { files: [], total: 0 };
      }

      // Filtrar apenas imagens (por extensão)
      let imageFiles = data.filter((file) => {
        const ext = file.name.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
      });

      // Aplicar busca se fornecida
      if (search) {
        const searchLower = search.toLowerCase();
        imageFiles = imageFiles.filter((file) =>
          file.name.toLowerCase().includes(searchLower)
        );
      }

      const total = imageFiles.length;

      // Aplicar paginação manual
      const paginatedFiles = imageFiles.slice(offset, offset + limit);

      // Mapear para formato ImageFile
      const files: ImageFile[] = paginatedFiles.map((file) => {
        const path = `${prefix}${file.name}`;
        return {
          name: file.name,
          path: path,
          url: this.getPublicUrl(path),
          size: file.metadata?.size || 0,
          createdAt: file.created_at || '',
          formattedSize: this.formatFileSize(file.metadata?.size || 0),
          formattedDate: this.formatDate(file.created_at || ''),
        };
      });

      return { files, total };
    } catch (error) {
      console.error('Error listing images:', error);
      throw error;
    }
  },

  /**
   * Lista todas as subpastas (anos e meses) disponíveis
   */
  async listFolders(type: 'posts' | 'covers' = 'posts'): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      // Listar anos
      const { data: years, error: yearsError } = await supabase.storage
        .from('imagens-site')
        .list(type, {
          limit: 100,
        });

      if (yearsError || !years) {
        return [];
      }

      const folders: string[] = [];

      // Para cada ano, listar meses
      for (const year of years) {
        if (year.id) {
          const { data: months } = await supabase.storage
            .from('imagens-site')
            .list(`${type}/${year.name}`, {
              limit: 12,
            });

          if (months) {
            months.forEach((month) => {
              if (month.id) {
                folders.push(`${type}/${year.name}/${month.name}/`);
              }
            });
          }
        }
      }

      return folders;
    } catch (error) {
      console.error('Error listing folders:', error);
      return [];
    }
  },
};



