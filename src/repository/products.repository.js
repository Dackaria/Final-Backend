import ProductDTO from "../dto/products.dto.js";

export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  insertProducts = async (products) => {
    const productsDTO = products.map(product => new ProductDTO(product));
    return this.dao.insertProducts(productsDTO);
  }

  getAllProducts = async () => {
    return this.dao.getAllProducts();
  };

  getProducts = async (page, limit, query, sort) => {
    return this.dao.getProducts(page, limit, query, sort);
  };

  getProductById = async (pid) => {
    return this.dao.getProductById(pid);
  };

  addProduct = async (product) => {
    const productDTO = new ProductDTO(product);
    return this.dao.addProduct(productDTO);
  };

  updateProduct = async (pid, newData) => {
    return this.dao.updateProduct(pid, newData);
  };

  deleteProduct = async (pid) => {
    return this.dao.deleteProduct(pid);
  };
}