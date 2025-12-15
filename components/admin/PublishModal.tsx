"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Upload, X, Tag, FolderOpen, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PublishModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onPublish: (data: PublishData) => void;
  publishing?: boolean;
};

export type PublishData = {
  coverImage: File | null;
  coverImageUrl?: string;
  publishDate: string;
  isScheduled: boolean;
  categories: string[];
  tags: string[];
};

export default function PublishModal({
  open,
  onOpenChange,
  title,
  onPublish,
  publishing = false,
}: PublishModalProps) {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCoverImagePreview(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setCoverImagePreview(null);
    }
  };

  const handleAddCategory = () => {
    const category = categoryInput.trim();
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDownCategory = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePublish = () => {
    onPublish({
      coverImage,
      coverImageUrl: coverImagePreview || undefined,
      publishDate: isScheduled ? publishDate : new Date().toISOString(),
      isScheduled,
      categories,
      tags,
    });
  };

  const resetForm = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    setIsScheduled(false);
    setPublishDate("");
    setCategories([]);
    setTags([]);
    setCategoryInput("");
    setTagInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-semibold">Publicar Post</DialogTitle>
          <DialogDescription className="text-base">
            Revise e configure os detalhes antes de publicar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview do Título */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Título do Post
            </Label>
            <div className="text-lg font-semibold text-foreground p-4 bg-muted/50 rounded-lg border border-border">
              {title || "Título sem título"}
            </div>
          </div>

          {/* Upload de Foto de Capa */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Imagem de Capa
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            {coverImagePreview ? (
              <div className="relative group">
                <img
                  src={coverImagePreview}
                  alt="Preview da capa"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-muted group-hover:bg-muted/80 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Clique para fazer upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou WEBP até 10MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Data de Publicação */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data de Publicação
            </Label>
            <RadioGroup value={isScheduled ? "scheduled" : "now"} onValueChange={(value) => setIsScheduled(value === "scheduled")}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="flex-1 cursor-pointer font-normal">
                  Publicar imediatamente
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="flex-1 cursor-pointer font-normal">
                  Programar publicação
                </Label>
              </div>
            </RadioGroup>
            {isScheduled && (
              <Input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="mt-2"
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>

          {/* Categorias */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Categorias
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma categoria..."
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleKeyDownCategory}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
                disabled={!categoryInput.trim()}
                size="sm"
              >
                Adicionar
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="gap-1.5 pl-3 pr-1 py-1.5"
                  >
                    {category}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-0.5 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remover ${category}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Tags
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                size="sm"
              >
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="gap-1.5 pl-3 pr-1 py-1.5"
                  >
                    <span className="text-muted-foreground">#</span>{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:bg-muted rounded-full p-0.5 transition-colors"
                      aria-label={`Remover ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={publishing}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={publishing || !title.trim()}
            className="min-w-[120px]"
          >
            {publishing ? (
              <>
                <span className="animate-pulse">Publicando...</span>
              </>
            ) : (
              isScheduled ? "Programar Publicação" : "Publicar Agora"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

