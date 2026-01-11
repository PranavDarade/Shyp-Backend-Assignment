import { Order } from "src/orders/order.entity";
import { Courier } from "src/couriers/courier.entity";

class InMemoryStore {
    private orders: Map<string, Order> = new Map();

    private couriers: Map<string, Courier> = new Map();

    addOrder(order: Order): void {
        this.orders.set(order.id, order);
    }

    getOrder(orderId: string): Order | undefined {
        return this.orders.get(orderId);
    }

    getAllOrders(): Order[] {
        return Array.from(this.orders.values());
    }

    updateOrder(order: Order): void {
        this.orders.set(order.id, order);
    }

    addCourier(courier: Courier): void {
        this.couriers.set(courier.id, courier);
    }

    getCourier(courierId: string): Courier | undefined {
        return this.couriers.get(courierId);
    }

    getAllCouriers(): Courier[] {
        return Array.from(this.couriers.values());
    }

    getAvailableCourier(): Courier[] {
        return Array.from(this.couriers.values()).filter(
            (courier) => courier.available,
        );
    }

    updateCourier(courier: Courier): void {
        this.couriers.set(courier.id, courier);
    }
}

export const inMemoryStore = new InMemoryStore();