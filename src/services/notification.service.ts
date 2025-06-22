import { getIO } from '../sockets';

export const notifyAdminOfNewOrder = (orderData: any) => {
    const io = getIO();
    io.to('admin-room').emit('new-order', {
        message: '🛒 New order placed!',
        order: orderData,
    });
};