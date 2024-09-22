import { PrismaClient } from '@prisma/client';
import { HttpException } from '@/errors/httpException'; // Replace with your HttpException import
import { checkInventoryAvailability } from './checkInventory'; // Adjust the import path
import { findAnotherStoreWithStock } from './findNearestStoreWithStock';
import { updateInventoryStock } from './updateInventoryStock';

const prisma = new PrismaClient();

export async function handleStockAndMutations(
  cartItems: { productId: number; qty: number; finalQty: number }[],
  deliveryAddress: { latitude: string; longitude: string },
  nearestStoreId: number,
  orderId: number,
  customerId: number
): Promise<void> {
  try {
    const latitude = parseFloat(deliveryAddress.latitude);
    const longitude = parseFloat(deliveryAddress.longitude);
    
    for (const item of cartItems) {
      const { productId, finalQty } = item;
      console.log(`Checking stock for product ID: ${productId}, Total Final Qty: ${finalQty}`);

      // Check how much stock the nearest store has
      const inventory = await checkInventoryAvailability(nearestStoreId, productId, finalQty);

      if (inventory.availableStock > 0) {
        const stockToDeductFromNearestStore = Math.min(inventory.availableStock, finalQty);
        await updateInventoryStock(nearestStoreId, productId, -stockToDeductFromNearestStore, orderId, customerId);
      
        const remainingQty = finalQty - stockToDeductFromNearestStore;
        if (remainingQty > 0) {
          await processAlternateStore(latitude, longitude, productId, remainingQty, nearestStoreId, orderId, customerId);
        }
      } else {
        // Directly look for an alternate store only if the nearest store has no stock
        await processAlternateStore(latitude, longitude, productId, finalQty, nearestStoreId, orderId, customerId);
      }
    }
  } catch (error) {
    console.error('Failed to handle stock and mutations:', error);
    throw new Error('Failed to handle stock and mutations');
  }
}

async function processAlternateStore(
  latitude: number,
  longitude: number,
  productId: number,
  qty: number,
  nearestStoreId: number,
  orderId: number,
  customerId: number
) {
  const alternateStore = await findAnotherStoreWithStock(latitude, longitude, productId, qty);
  if (alternateStore) {
    console.log(`Alternate store found with stock:`, alternateStore);

    // Create mutation record for transferring stock between stores
    const mutation = await prisma.mutation.create({
      data: {
        fromStoreId: alternateStore.id,
        toStoreId: nearestStoreId,
        mutationStatus: 'REQUESTED',
      },
    });

    // Create a MutationStatusUpdate after the mutation
    await prisma.mutationStatusUpdate.create({
      data: {
        creatorId: customerId,
        mutationId: mutation.id,
        mutationStatus: 'REQUESTED',
        description: `Request for mutation of ${qty} items from store ${alternateStore.id} to ${nearestStoreId}`,
      },
    });

    // Update the inventory for the quantity in the alternate store
    await updateInventoryStock(alternateStore.id, productId, -qty, orderId, customerId);
  } else {
    throw new HttpException(400, `No store found with sufficient stock for product ID: ${productId}`);
  }
}