import UserDTO from "../dto/users.dto.js";

export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getUser = async (email, password) => {
    return this.dao.getUser(email, password);
  }

  addUser = async (user) => {
    const userDTO = new UserDTO(user);
    return this.dao.addUser(userDTO);
  }

  changePassword = async (email, new_password) => {
    return this.dao.changePassword(email, new_password);
  }

  checkUser = async (email) => {
    return this.dao.checkUser(email);
  }

  changeRole = async (email, new_role) => {
    // return this.dao.changeRole(uid, new_role);
    return this.dao.changeRole(email, new_role);

  }

  getAllUsers = async () => {
    return this.dao.getAllUsers();
  }

  deleteUser = async (email) => {
    return this.dao.deleteUser(email);
  }

  deleteOldUsers = async () => {
    return this.dao.deleteOldUsers();
  }
}