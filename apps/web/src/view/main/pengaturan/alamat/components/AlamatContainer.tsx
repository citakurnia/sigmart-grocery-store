import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import Loading from '@/components/Loading';
import Error from '@/app/error';
import AlamatCard from './AlamatCard';
import { Address } from '@/types/addressType';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AlamatContainer = () => {
  const token = getCookie('access-token');

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryFn: async () => {
      const res = await axiosInstance().get(`/user/addresses`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data.addresses;
    },
    queryKey: ['user_addresses'],
  });

  useEffect(() => {
    if (data) {
      setAddresses(data);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm === '') {
      setAddresses(data);
    } else {
      const filteredAddresses = data.filter(
        (address: Address) =>
          address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          address.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setAddresses(filteredAddresses);
    }
  }, [searchTerm, data]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div className="flex justify-center items-center w-full min-h-[120px] md:min-h-[320px]">
          <Error error={error} reset={refetch} />
        </div>
      ) : (
        <div className="flex flex-col w-full space-y-4 py-4">
          <div className="flex flex-row justify-between items-center gap-4 w-full">
            <div className="relative w-full md:max-w-[336px]">
              <Input
                type="search"
                placeholder="Tulis nama / alamat / kode pos"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
              <Search className="absolute left-2.5 top-3 size-4 text-muted-foreground" />
            </div>
            <Button className="bg-main-dark hover:bg-main-dark/80">
              <Plus className="size-4 mr-0 md:mr-2" />
              <span className="hidden md:inline-block">Tambah Alamat</span>
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {addresses && addresses?.length > 0 ? (
              addresses.map((address: Address, index: number) => {
                return (
                  <AlamatCard
                    key={`${address.id}-${index}`}
                    fullAddress={address}
                  />
                );
              })
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AlamatContainer;