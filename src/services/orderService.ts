import { OrderStatus, Order, Prisma } from "@prisma/client";
import { DB } from "./db";

import { createPaginator } from 'prisma-pagination';

const db = DB.instance;
const paginate = createPaginator({ perPage: 10 });


interface OrderQueryParams {
    page?: number;
    searchByUsername?: string;
    status?: OrderStatus;
}



function filterObj(
    status?: OrderStatus, 
    searchByUsername?: string,
): Prisma.OrderFindManyArgs {

    const filter = { where: {} as Prisma.OrderWhereInput };
    if (status) filter.where.status = status;
    if (searchByUsername) filter.where.customer = { username: { contains: searchByUsername, mode: "insensitive" } };

    return filter;
}



export async function insertNewOrder({
    receiversName,
    receiversEmail,
    treeNumbers,
    customerId,
    isCoordRequired,
    message = "This goes towards the restoration of the forest corridor along the Lower Kinabatangan, Sabah, malaysia, Borneo.",
    status = OrderStatus.IN_REVIEW,
}: {
    receiversName: string,
    receiversEmail: string,
    treeNumbers: number,
    customerId: number,
    isCoordRequired?: boolean,
    message?: string,
    status?: OrderStatus,
}) {
    await db.order.create({
        data: {
            receiver_name: receiversName,
            receiver_email: receiversEmail,
            trees_number: treeNumbers,
            customer: {
                connect: { id: customerId }
            },
            status,
            isCoordRequired,
            message,
        }
    });

    console.log(`Order created successfully at ${new Date().toLocaleString()}`);
}





export async function findOrderById(id: number) {
    return await db.order.findUnique({
        where: { id }
    });
}


export async function findOrderByReceiverName(receiverName: string) {
    return await db.order.findFirst({
        where: {
            receiver_name: receiverName
        }
    });
}


export async function findAllOrders({
    page = 1,
    searchByUsername,
    status,
}: OrderQueryParams) {
    return await paginate<Order, Prisma.OrderFindManyArgs>(
        db.order,
        filterObj(status, searchByUsername),
        { page, }
    );
}



export async function updateOrder(id: number, data: Partial<Order>) {
    return await db.order.update({
        where: { id },
        data
    });
}