import { Location } from "src/orders/order.entity";

export function calculateManhattanDistance(
    from: Location,
    to: Location,
): number {
    return Math.abs(from.x - to.y) + Math.abs(from.y - to.y);
}