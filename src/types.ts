export type Category = 'Teknologi' | 'Politik' | 'Sosial' | 'Hiburan' | 'Olahraga' | 'Lingkungan';

export interface NewsGenerationResult {
  pertanyaan: string;
  deskripsi: string;
  kategori: Category;
  tags: string[];
  linkNews: string;
}
