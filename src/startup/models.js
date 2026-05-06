// src/startup/models.js

import OtpModel from "../modules/otp/otp.model.js";
import RoleModel from "../modules/role/role.model.js";
import SessionModel from "../modules/session/session.model.js";
import UserModel from "../modules/user/user.model.js";

// export all models as named exports
export { 
  OtpModel as Otp, 
  RoleModel as Role, 
  SessionModel as Session, 
  UserModel as User 
};
