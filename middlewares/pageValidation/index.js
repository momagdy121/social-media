import isOwner from "./isOwner.js";
import isPageAdmin from "./isPageAdmin.js";
import isUserInPendingAdminRequests from "./isUserInPendingAdminRequests.js";

const pageValidation = {
  isOwner,
  isPageAdmin,
  isUserInPendingAdminRequests,
};

export default pageValidation;
