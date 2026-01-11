import { Delete, Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';

import { inMemoryStore } from 'src/storage/in-memory.store';
import { Order } from 'src/orders/order.entity';
import { OrderState } from 'src/orders/order.state';
import { Courier } from 'src/couriers/courier.entity';
import { calculateManhattanDistance } from './distance.util';
import { DeliveryType } from 'src/orders/order.entity';

@Injectable()
export class AssignmentService {
    private readonly assignmentMutex = new Mutex();

    private readonly EXPRESS_DISTANCE_THRESHOLD = 7;

    async assignCourierToOrder(
        order: Order,
    ): Promise<{
        assigned: boolean;
        courier?: Courier;
        reason?: string;
    }> {
        return this.assignmentMutex.runExclusive(async () => {
            if (order.state !== OrderState.CREATED) {
                return {
                    assigned: false,
                    reason: `Order is not in CREATED state`,
                };
            }

            const availableCouriers = inMemoryStore.getAvailableCourier();

            if (availableCouriers.length === 0) {
                return {
                    assigned: false,
                    reason: `No available couriers`,
                }
            }

            let selectedCourier: Courier | null = null;
            let minDistance = Infinity;

            for (const courier of availableCouriers) {
                const distance = calculateManhattanDistance(
                    courier.location,
                    order.pickupLocation,
                );

                if (
                    order.deliveryType === DeliveryType.EXPRESS && 
                    distance > this.EXPRESS_DISTANCE_THRESHOLD
                ) {
                    continue;
                }

                if (distance < minDistance) {
                    minDistance = distance;
                    selectedCourier = courier;
                }
            }

            if (!selectedCourier) {
                return {
                    assigned: false,
                    reason: order.deliveryType === DeliveryType.EXPRESS ? 
                    `No courier within express distance threshold` 
                    : `No eligible courier found`,
                };
            }

            selectedCourier.assignOrder(order.id);
            order.assignedCourierId = selectedCourier.id;
            order.state = OrderState.ASSIGNED;

            inMemoryStore.updateCourier(selectedCourier);
            inMemoryStore.updateOrder(order);

            return {
                assigned: true,
                courier: selectedCourier,
            };
        });
    }
}