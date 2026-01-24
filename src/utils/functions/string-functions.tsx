import { NotifyError } from "@/components/toast/toast";
import { saveAs } from "file-saver";

function formatDateDMY(date: Date, showTime?: boolean) {
  try {
    if (showTime) {
      const formatedDate = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
        hour12: true,
      }).format(date);
      return formatedDate.toUpperCase();
    }
    return new Intl.DateTimeFormat("en-GB").format(date);
  } catch (error) {
    throw error;
  }
}

function formatAmount(amount: number): string {
  try {
    return new Intl.NumberFormat("en-EN", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "symbol",
    }).format(amount);
  } catch (error) {
    throw error;
  }
}

function todayDate(): string {
  const today = new Date();
  const dd = String(today.getDate());
  const mm = String(today.getMonth() + 1);
  const yyyy = today.getFullYear();
  const todayString = dd + "-" + mm + "-" + yyyy;
  return todayString;
}

function checkCategory(san: boolean, bencher: boolean) {
  if (san) {
    return "san";
  } else if (bencher) {
    return "bencher";
  } else return "lawyer";
}

function todayYear(): string {
  const today = new Date();
  const dd = String(today.getDate());
  const mm = String(today.getMonth() + 1);
  const yyyy = today.getFullYear();
  const todayYearString = String(yyyy);
  return todayYearString;
}

type CheckDateRangeType = {
  state: boolean;
  startDate: string;
  endDate: string;
};

function checkDateRange(
  startParam: string,
  endParam: string
): CheckDateRangeType {
  const today = new Date();
  const dd = String(today.getDate());
  const mm = String(today.getMonth() + 1);
  const yyyy = today.getFullYear();
  const todayString = yyyy + "-" + mm + "-" + dd;

  const date = new Date(todayString);
  const start = new Date(startParam);
  const end = new Date(endParam);

  if (date >= start && date <= end) {
    return {
      state: true,
      startDate: String(start),
      endDate: String(end),
    };
  } else {
    return {
      state: false,
      startDate: String(start),
      endDate: String(end),
    };
  }
}
function formatCreatedAtDate(dateString: string) {
  const date = new Date(dateString);
  const options: any = { year: "numeric", month: "2-digit", day: "2-digit" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options)
    .format(date)
    .replace(/\//g, "-");

  return formattedDate;
}

const blobToBase64 = (blob: any, callback: any) => {
  let reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = function () {
    callback(reader.result);
  };
};

const isWithinDateRange = (str: string) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const rangeStartYear = currentYear - 9;
  const rangeEndYear = currentYear - 1;
  const regex = new RegExp(`^\\d{4}$`);

  if (!regex.test(str)) {
    NotifyError("Please enter a valid date.");
    return false;
  }

  const year = parseInt(str);

  if (year >= rangeStartYear && year <= rangeEndYear) {
    return true;
  } else {
    NotifyError(
      "Date must be within " + rangeStartYear + " to " + rangeEndYear
    );
    return false;
  }
};

const setInitialColor = (id: number) => {
  const colorScale = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-black",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-indigo-500",
    "bg-gray-500",
  ];
  return colorScale[id];
};

const downloadImage = async (
  blob: string,
  fileExtension: string,
  name: string
) => {
  try {
    saveAs(blob, `${name}.${fileExtension}`);
  } catch (error) {
    NotifyError(`Error downloading image: , ${error}`);
  }
};

export {
  isWithinDateRange,
  checkDateRange,
  formatDateDMY,
  formatAmount,
  todayDate,
  todayYear,
  checkCategory,
  blobToBase64,
  setInitialColor,
  formatCreatedAtDate,
  downloadImage,
};
