import prisma from '@/prisma';
import { TCreateAddress, TUpdateAddress } from '@/types/userUpdateType';

class AddressQuery {
  public async getAddressQuery(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        addresses: {
          where: {
            deleted: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            name: true,
            address: true,
            zipCode: true,
            latitude: true,
            longitude: true,
            isMain: true,
          },
        },
      },
    });

    return user;
  }

  public async getAddressById(userId: number, addressId: number) {
    const address = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        addresses: {
          where: {
            id: addressId,
          },
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return address?.addresses[0];
  }

  public async createAddressQuery({
    id,
    name,
    address,
    zipCode,
    latitude,
    longitude,
  }: TCreateAddress) {
    const createAddress = await prisma.user.update({
      where: {
        id,
      },
      data: {
        addresses: {
          create: {
            name,
            address,
            zipCode,
            latitude,
            longitude,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return createAddress;
  }

  public async updateAddressQuery({
    id,
    addressId,
    name,
    address,
    zipCode,
    latitude,
    longitude,
  }: TUpdateAddress) {
    let dataUpdate = {};

    if (name) dataUpdate = { ...dataUpdate, name };
    if (address) dataUpdate = { ...dataUpdate, address };
    if (zipCode) dataUpdate = { ...dataUpdate, zipCode };
    if (latitude) dataUpdate = { ...dataUpdate, latitude };
    if (longitude) dataUpdate = { ...dataUpdate, longitude };

    const updateAddress = await prisma.user.update({
      where: {
        id,
      },
      data: {
        addresses: {
          update: {
            where: {
              id: addressId,
            },
            data: { ...dataUpdate },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return updateAddress;
  }

  public async deleteAddressQuery({ id, addressId }: TUpdateAddress) {
    const updateAddress = await prisma.user.update({
      where: {
        id,
      },
      data: {
        addresses: {
          update: {
            where: {
              id: addressId,
            },
            data: {
              deleted: true,
              isMain: false,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return updateAddress;
  }

  public async changeMainAddressQuery({ id, addressId }: TUpdateAddress) {
    const updateMainAddress = await prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        addresses: {
          update: {
            where: {
              id: addressId,
            },
            data: {
              isMain: true,
            },
          },
          updateMany: {
            where: {
              id: {
                not: addressId,
              },
            },
            data: {
              isMain: false,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return updateMainAddress;
  }
}

export default new AddressQuery();