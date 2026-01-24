import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment, FunctionalComponent } from "preact";
import { Transition } from "@headlessui/react";
import classNames from "classnames";

type ComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  dimensions?: "md" | "lg" | "xl" | "2xl" | "screen";
  classes?: string;
  showCloseIcon?: boolean;
  zIndex?: number;
};

export const Modal: FunctionalComponent<ComponentProps> = ({
  isOpen,
  onClose,
  children,
  dimensions = "md",
  showCloseIcon = false,
  classes,
  zIndex = 70,
}) => {
  const modalClasses = classNames(
    "w-full transform overflow-hidden bg-white p-6 lg:p-10 rounded text-left align-middle shadow-xl transition-all ",
    classes,
    {
      "max-w-md": dimensions === "md",
      "max-w-lg": dimensions === "lg",
      "max-w-xl": dimensions === "xl",
      "max-w-2xl": dimensions === "2xl",
      "max-w-screen": dimensions === "screen",
    },
  );
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <div className={`relative`} style={{ zIndex: zIndex }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div
              className="flex min-h-full items-center justify-center p-2 lg:p-4 text-center"
              // onClick={onClose}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={modalClasses}
                >
                  {showCloseIcon && (
                    <div
                      className="cursor-pointer absolute top-0 right-0 m-4 h-5 bg-white mt-9 lg:mt-12 lg:mr-10"
                      onClick={onClose}
                      onKeyPress={onClose}
                      role="button"
                      tabIndex={0}
                    >
                      <XMarkIcon className="w-5 h-5 text-black font-bold" />
                    </div>
                  )}
                  {children}
                </div>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};
