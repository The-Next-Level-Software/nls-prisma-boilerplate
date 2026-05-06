import { StatusCodes } from "http-status-codes";

import QueryEngine from "../../services/query.service.js";
import RoleModel from "../role/role.model.js";
import UserModel from "./user.model.js";
import { generateApiResponse } from "../../utils/response.util.js";

class UserController {
  static async getAllUsers(req, res) {
    const { role = "user" } = req.query;

    const adminRoles = await RoleModel.find({ 
      where: { name: role } 
    });

    const engine = new QueryEngine(UserModel, req.query, {
      where: {
        isActive: true,
        roleId: { in: adminRoles.map((r) => r.id) },
      },
      searchable: ["name", "email"],
    });

    const result = await engine.exec("users");

    return generateApiResponse(res, StatusCodes.OK, "Users retrieved successfully", result);
  }
}

export default UserController;
