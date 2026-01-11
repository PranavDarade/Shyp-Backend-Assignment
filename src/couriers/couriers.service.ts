import { Injectable } from '@nestjs/common';
import { Courier } from './courier.entity';
import { inMemoryStore } from 'src/storage/in-memory.store';
import { OrdersService } from 'src/orders/orders.service';
import { OrderState } from 'src/orders/order.state';


@Injectable()
export class CouriersService {
    constructor(
        private readonly orderService: OrdersService,
    ) {}

    // Adds a courier to the system 
    addCourier(params: {
        id: string;
        name: string;
        location: { x: number, y: number }; 
    }): Courier {
        const courier = new Courier({
            id: params.id,
            name: params.name,
            location: params.location,
        });

        inMemoryStore.addCourier(courier);
        return courier;
    }

    // Target is pickupLocation until pickedup, then drop loaction until delivered
    moveCourier(courierId: string): Courier {
        const courier = inMemoryStore.getCourier(courierId);

        if (!courier) {
            throw new Error(`Courier ${courierId} not found`);
        }

        // Courier has no active order
        if (!courier.activeOrderId) {
            return courier;
        }

        const order = inMemoryStore.getOrder(courier.activeOrderId);

        if (!order) {
            throw new Error (
                `Order ${courier.activeOrderId} not found`,
            );
        }

        let targetLocation;

        if (order.state === OrderState.ASSIGNED) {
            targetLocation = order.pickupLocation;
        } else if (
            order.state === OrderState.PICKED_UP ||
            order.state === OrderState.IN_TRANSIT
        ) {
            targetLocation = order.dropLocation;
        } else {
            return courier;
        }

        // Move in x direction 
        if (courier.location.x < targetLocation.x) {
            courier.location.x += 1;
        } else if (courier.location.x > targetLocation.x) {
            courier.location.x -= 1;
        }

        // Move in y direction 
        if (courier.location.y < targetLocation.y) {
            courier.location.y += 1;
        } else if (courier.location.y > targetLocation.y) {
            courier.location.y -= 1;
        }

        // Arrival at pickup
        if (
            order.state === OrderState.ASSIGNED && 
            courier.location.x === order.pickupLocation.x &&
            courier.location.y === order.pickupLocation.y
        ) {
            this.orderService.updateOrderState(
                order.id,
                OrderState.PICKED_UP,
            );
        }

        // After pickup
        if (
            order.state === OrderState.PICKED_UP &&
            courier.location.x !== order.pickupLocation.x &&
            courier.location.y !== order.pickupLocation.y
        ) {
            this.orderService.updateOrderState(
                order.id,
                OrderState.IN_TRANSIT,
            );
        }

        // Arrival at drop
        if (
            order.state === OrderState.IN_TRANSIT &&
            courier.location.x === order.dropLocation.x &&
            courier.location.y === order.dropLocation.y
        ) {
            this.orderService.updateOrderState(
                order.id,
                OrderState.DELIVERED,
            );

            // Release courier
            courier.release();
        }

        // Persist courier changes
        inMemoryStore.updateCourier(courier);

        return courier;
    }
}