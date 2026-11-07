import { BadRequestError } from '../middlewares/customErrors.js';

export const BOOKING_CLOSED_MSG = 'Booking Entry Closed';

/**
 * Checks if a serviceJobNo has a closed booking in database.
 * Throws BadRequestError('Booking Entry Closed') if closed.
 */
export const checkBookingNotClosed = async (db, serviceJobNo) => {
  if (!serviceJobNo) return;
  const cleanJob = String(serviceJobNo).trim();
  if (
    !cleanJob ||
    cleanJob === '—' ||
    cleanJob === '-' ||
    cleanJob.toUpperCase().startsWith('BOM-UPLOAD')
  ) {
    return;
  }

  const booking = await db.serviceBooking.findFirst({
    where: { serviceJobNo: cleanJob }
  });

  if (booking) {
    const tempStatus = String(booking.tempStatus || '').trim().toLowerCase();
    const status = String(booking.status || '').trim().toLowerCase();
    if (
      tempStatus === 'close' ||
      tempStatus === 'closed' ||
      status === 'close' ||
      status === 'closed'
    ) {
      throw new BadRequestError(BOOKING_CLOSED_MSG);
    }
  }
};
