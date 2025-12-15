"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseImages } from '@/hooks/useSupabaseImages';
import { ImageFile } from '@/lib/imageUploadService';
import ImagePreviewModal from './ImagePreviewModal';
import {
  Upload,
  Search,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, alt?: string) => void;
  type?: 'posts' | 'covers';
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectImage,
  type = 'posts',
}: ImageGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images,
    loading,
    error,
    fetchImages,
    uploadImage,
    searchImages,
    totalPages,
    currentPage,
    totalImages,
  } = useSupabaseImages({
    prefix: `${type}/`,
    pageSize: 20,
    autoFetch: isOpen,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const url = await uploadImage(selectedFile, type);
      onSelectImage(url, selectedFile.name);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(searchQuery);
  };

  const handleImageClick = (image: ImageFile) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  };

  const handleSelectFromPreview = (image: ImageFile) => {
    onSelectImage(image.url, image.name);
    setPreviewOpen(false);
    onClose();
  };

  const handleNavigatePreview = (direction: 'prev' | 'next') => {
    if (!previewImage) return;
    const currentIndex = images.findIndex((img) => img.path === previewImage.path);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < images.length) {
      setPreviewImage(images[newIndex]);
    }
  };

  const canNavigatePreview = () => {
    if (!previewImage) return { prev: false, next: false };
    const currentIndex = images.findIndex((img) => img.path === previewImage.path);
    return {
      prev: currentIndex > 0,
      next: currentIndex < images.length - 1,
    };
  };

  const handlePageChange = (page: number) => {
    fetchImages(page);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Inserir Imagem</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Galeria ({totalImages})
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Novo
              </TabsTrigger>
            </TabsList>

            {/* Tab: Galeria */}
            <TabsContent value="gallery" className="flex-1 flex flex-col space-y-4 mt-4">
              {/* Busca */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Buscar
                </Button>
              </form>

              {/* Grid de Imagens */}
              <div className="flex-1 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                {!loading && !error && images.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <ImageIcon className="h-12 w-12 mb-3 text-gray-300" />
                    <p className="text-sm">Nenhuma imagem encontrada</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab('upload')}
                      className="mt-2"
                    >
                      Fazer upload da primeira imagem
                    </Button>
                  </div>
                )}

                {!loading && !error && images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.path}
                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                          <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity w-full">
                            <p className="text-xs truncate font-medium">{image.name}</p>
                            <p className="text-xs text-gray-300">{image.formattedSize}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Upload */}
            <TabsContent value="upload" className="flex-1 flex flex-col space-y-4 mt-4">
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        disabled={uploading}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Fazer Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Selecione uma imagem
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF ou WEBP (máx. 3MB)
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Escolher Arquivo
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <ImagePreviewModal
        image={previewImage}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSelect={handleSelectFromPreview}
        onNavigate={handleNavigatePreview}
        canNavigate={canNavigatePreview()}
      />
    </>
  );
}



