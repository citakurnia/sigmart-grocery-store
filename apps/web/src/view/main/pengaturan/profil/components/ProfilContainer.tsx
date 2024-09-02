import React from 'react';
import AvatarCard from './AvatarCard';
import ProfilForm from './ProfilForm';
import { getCookie } from 'cookies-next';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import Loading from '@/components/Loading';
import Error from '@/app/error';

const ProfilContainer = () => {
  const token = getCookie('access-token');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryFn: async () =>
      await axiosInstance().get(`/user/profile`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    queryKey: ['user_profile'],
  });

  console.log(data?.data.data);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div className="flex justify-center items-center w-full min-h-[120px] md:min-h-[320px]">
          <Error error={error} reset={refetch} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full space-y-8 md:space-y-0">
          <AvatarCard
            avatar={data?.data.data.avatar}
            isPassword={data?.data.data.isPassword}
          />
          <ProfilForm profile={data?.data.data} refetch={refetch} />
        </div>
      )}
    </>
  );
};

export default ProfilContainer;