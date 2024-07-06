export default class CartRepository {
    constructor(dao) {
      this.dao = dao;
    }
  
    addCart = async () => {
      return this.dao.addCart();
    }
    
    getCartById = async (cid) => {
      return this.dao.getCartById(cid);
    };
  
    addProductToCart = async (cid, pid, userEmail) => {
      return this.dao.addProductToCart(cid, pid, userEmail);
    };
  
    deleteProductInCart = async (cid, pid) => {
      return this.dao.deleteProductInCart(cid, pid);
    };
  
    deleteAllInCart = async (cid) => {
      return this.dao.deleteAllInCart(cid);
    };
  
    updateProductQuantityInCart = async (cid, pid, newQuantity) => {
      return this.dao.updateProductQuantityInCart(cid, pid, newQuantity);
    };
  
    updateCart = async (cid, newData) => {
      return this.dao.updateCart(cid, newData);
    };
  
    buyCart = async (user) => {
      return this.dao.buyCart(user);
    };
  }