import { Transition } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { Fragment, FunctionalComponent } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import { useOnClickOutside } from "../hooks/use-onclickoutside";
import useToggle from "../hooks/use-toggles";

export const TableItemMenu: FunctionalComponent = ({ children }) => {
  const [openMenu, toggleMenu] = useToggle(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<any>({});
  const co = useOnClickOutside(ref, () => toggleMenu(false));

  useEffect(() => {
    if (openMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const spaceBelow = viewHeight - rect.bottom;

      const newStyle: any = {
        right: `${window.innerWidth - rect.right}px`,
      };

      // If less than 300px space below, and enough space above, flip up
      if (spaceBelow < 300 && rect.top > 300) {
        newStyle.bottom = `${viewHeight - rect.top}px`;
        newStyle.top = "auto";
      } else {
        newStyle.top = `${rect.bottom}px`;
        newStyle.bottom = "auto";
      }

      setMenuStyle(newStyle);
    }
  }, [openMenu]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <div>
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className={"text-gray-600 hover:text-gray-500"}
        >
          <span className="sr-only">Item menu</span>
          <EllipsisHorizontalIcon className="w-8 h-8 rotate-90" />
        </button>
      </div>
      <Transition
        show={openMenu}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className="fixed w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto z-[9999]"
          style={menuStyle}
          onClick={() => toggleMenu(false)}
        >
          {children}
        </div>
      </Transition>
    </div>
  );
};
