import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axiosInstance';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CategoryProps } from '@/types/categoryTypes';

export default function AddSubcategoryButton() {
  const [name, setName] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<CategoryProps[]>([]);

  async function fetchCategories() {
    const categoriesResult = await axiosInstance().get(
      `${process.env.API_URL}/categories`,
    );

    setCategories(categoriesResult.data.data);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleOnClick() {
    try {
      const response = await axiosInstance().post(`/subcategories`, {
        name: name,
        parentCategoryId,
      });

      setIsOpen(false);
      if (response.status == 200) {
        window.location.reload();
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Subkategori tidak dibuat',
          description: err.response?.data.message,
        });
      } else {
        alert(err);
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Subkategori
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah subkategori</DialogTitle>
          <div />
          <DialogDescription>
            Buat subkategori Anda di sini. Klik tambahkan saat Anda selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input
              id="name"
              defaultValue={name}
              className="col-span-3"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Kategori
            </Label>
            <Select onValueChange={(e) => setParentCategoryId(e)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="-- Pilih Kategori --" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleOnClick}>
            Tambahkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}