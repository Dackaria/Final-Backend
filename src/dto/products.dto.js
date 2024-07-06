export default class ProductDTO {
    constructor(product) {
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.thumbnails = product.thumbnails ?? [];
        this.code = crypto.randomUUID();
        this.status = product.status ?? true;
        this.stock = product.stock ?? 0;
        this.category = product.category;
        this.owner = product.owner ?? "adminCoder@coder.com";
    }
}