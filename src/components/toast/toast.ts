import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const NotifyError = (message: string, duration: number = 5000) =>
  toast.error(message, {
    position: "top-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

export const NotifySuccess = (message: string, duration: number = 5000) =>
  toast.success(message, {
    position: "top-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

export const NotifyWarning = (message: string, duration: number = 5000) =>
  toast.warn(message, {
    position: "top-right",
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
