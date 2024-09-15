import prisma from '@/prisma';
import { HttpException } from '@/errors/httpException';
import { HttpStatus } from '@/types/error';
import { State, Store } from '@prisma/client';

class StoreQuery {
  public async findSingleStore(storeId: number): Promise<Store | null> {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    return store;
  }

  public async findStoreByIdBasedOnCategory(id: number) {
    const storeProduct = await prisma.productCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            products: {
              take: 2,
              where: {
                productState: {
                  equals: 'PUBLISHED',
                },
                inventories: {
                  some: {
                    storeId: id,
                    stock: {
                      gt: 0,
                    },
                  },
                },
              },
              select: {
                id: true,
                name: true,
                description: true,
                prices: {
                  where: {
                    active: true,
                  },
                  select: {
                    price: true,
                  },
                },
                images: {
                  take: 1,
                  select: {
                    title: true,
                  },
                },
                inventories: {
                  where: {
                    storeId: id,
                  },
                  select: {
                    storeId: true,
                    stock: true,
                    store: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return storeProduct;
  }

  public async findAllStoreAndReturnLatAndLong() {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        addresses: {
          where: { deleted: false },
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return stores;
  }

  public async findStoreById(id: number) {
    const store = await prisma.store.findUnique({
      where: {
        id,
      },
      select: {
        addresses: {
          where: {
            deleted: false,
          },
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    return store?.addresses[0];
  }

  public async getAllStore() {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return stores;
  }

  public async searchStores({
    keyword = '',
    state,
    sortBy = 'createdAt',
    sortOrder = 'asc',
  }: {
    keyword: string;
    state: State;
    sortBy: string;
    sortOrder: string;
  }) {
    return await prisma.store.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: {
                  contains: keyword,
                },
              },
              {
                addresses: {
                  some: {
                    address: {
                      contains: keyword,
                    },
                    deleted: false,
                  },
                },
              },
              {
                creator: {
                  OR: [
                    {
                      email: {
                        contains: keyword,
                      },
                    },
                    {
                      profile: {
                        name: {
                          contains: keyword,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },

          state ? { storeState: state } : {},
        ],
      },

      orderBy:
        sortBy === 'admins'
          ? {
              admins: {
                _count: sortOrder as any,
              },
            }
          : {
              createdAt: sortOrder as any,
            },
      include: {
        creator: true,
        addresses: true,
        admins: true,
      },
    });
  }
}

export default new StoreQuery();
