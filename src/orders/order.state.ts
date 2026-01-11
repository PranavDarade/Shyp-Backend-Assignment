import { BadRequestException } from "@nestjs/common";

export enum OrderState {
    CREATED = 'CREATED',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export const ORDER_STATE_TRANSITIONS: Record<OrderState, OrderState[]> = {
    [OrderState.CREATED]: [
        OrderState.ASSIGNED,
        OrderState.CANCELLED,
    ],
    
    [OrderState.ASSIGNED]: [
        OrderState.PICKED_UP,
        OrderState.CANCELLED,
    ],

    [OrderState.PICKED_UP]: [
        OrderState.IN_TRANSIT,
    ],

    [OrderState.IN_TRANSIT]: [
        OrderState.DELIVERED,
    ],

    [OrderState.DELIVERED]: [],

    [OrderState.CANCELLED]: [],
}

export function isValidOrderStateTransition(
    from: OrderState,
    to: OrderState,
): boolean {
    return ORDER_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidOrderStateTransition(
    from: OrderState,
    to: OrderState,
): void {
    if (!isValidOrderStateTransition(from, to)) {
        throw new BadRequestException(
            `Invalid order state transitions from ${from} to ${to}`,
        );
    }
}