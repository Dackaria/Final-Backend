export default class TicketDTO {
    constructor(ticket) {
        this.code = crypto.randomUUID();
        this.purchase_datetime = Date.now();
        this.amount = ticket.amount ?? 0;
        this.purchaser = ticket.purchaser ?? "";
    }
}