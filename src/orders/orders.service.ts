import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Order, DeliveryType, Location } from './order.entity';
import { OrderState } from './order.state';
import { assertValidOrderStateTransition } from './order.state';
import { inMemoryStore } from 'src/storage/in-memory.store';
import { AssignmentService } from 'src/assignment/assignment.service';
import { count } from 'console';
import { Courier } from 'src/couriers/courier.entity';


@Injectable()
export class OrdersService {
    constructor(
        private readonly assignmentService: AssignmentService,
    ) {}

    // Creates a new order and attempts auto assignment
    async createOrder(params: {
        pickupLocation: Location;
        dropLocation: Location;
        deliveryType: DeliveryType;
    }): Promise<Order> {
        const order = new Order({
            id: uuidv4(),
            pickupLocation: params.pickupLocation,
            dropLocation: params.dropLocation,
            deliveryType: params.deliveryType,
        });
        
        // Persist order in created state
        inMemoryStore.addOrder(order);

        // Attempt auto assignment 
        await this.assignmentService.assignCourierToOrder(order);

        return order;
    }

    // Retrieves an order by ID
    getOrderById(orderId: string): Order {
        const order = inMemoryStore.getOrder(orderId);

        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }

        return order;
    }

    // Cancels an order if allowed by state machine 
    cancelOrder(orderId: string): Order {
        const order = this.getOrderById(orderId);

        assertValidOrderStateTransition(
            order.state,
            OrderState.CANCELLED,
        );

        order.state = OrderState.CANCELLED;

        // Release courier if assigned
        if (order.assignedCourierId) {
            const courier = inMemoryStore.getCourier(
                order.assignedCourierId,
            );

            if (courier) {
                courier.release();
                inMemoryStore.updateCourier(courier);
            }
            order.assignedCourierId = null;
        }
        
        inMemoryStore.updateOrder(order);

        return order;
    }

    // Internal helper to update order state
    updateOrderState(
        orderId: string,
        nextState: OrderState,
    ): Order {
        const order = this.getOrderById(orderId);

        assertValidOrderStateTransition(order.state, nextState);

        order.state = nextState;
        inMemoryStore.updateOrder(order);

        return order;
    }
}
