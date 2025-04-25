import errorMessagesCategory from "./category/category.error";
import errorMessagesCity from "./city/city.error";
import errorMessagesCommon from "./common/common.error";
import errorMessagesDocument from "./document/document.error";
import errorMessagesFile from "./file/file.error";
import errorMessagesInsurer from "./insurer/insurer.error";
import errorMessagesOtp from "./otp/otp.error";
import errorMessagesUsers from "./users/users.error";
import errorMessagesVehicles from "./vehicle/vehicle.error";

const errorMessages = {
  ...errorMessagesUsers,
  ...errorMessagesCommon,
  ...errorMessagesOtp,
  ...errorMessagesCity,
  ...errorMessagesDocument,
  ...errorMessagesVehicles,
  ...errorMessagesInsurer,
  ...errorMessagesFile,
  ...errorMessagesCategory,
};

export default errorMessages;
